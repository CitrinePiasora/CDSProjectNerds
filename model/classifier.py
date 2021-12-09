from typing import List
from torch.types import _TensorOrTensors

import torch
from torch import nn
from torch.nn import functional as F


class ScaledDotProductAttention(nn.Module):
    """ Scaled Dot-Product Attention """
    def __init__(self, temperature, attn_dropout=0.1):
        super().__init__()
        self.temperature = temperature
        self.dropout = nn.Dropout(attn_dropout)

    def forward(self, q, k, v):
        attn = torch.matmul(q / self.temperature, k.transpose(2, 3))
        attn = self.dropout(F.softmax(attn, dim=-1))
        output = torch.matmul(attn, v)
        return output, attn


class MultiHeadAttention(nn.Module):
    """
    Self-Attention mechanism for the RNN.
    https://arxiv.org/abs/1706.03762
    """
    def __init__(self, n_heads: int, hidden_size: int=256, key_size: int=32,
                value_size: int=32, dropout: float=0.5) -> None:
        super().__init__()
        assert hidden_size % n_heads == 0
        self.n_heads = n_heads
        self.hidden_size = hidden_size
        self.key_size = key_size
        self.value_size = value_size
        self.dropout = dropout

        self.w_qs = nn.Linear(hidden_size, self.n_heads * self.key_size, bias=False)
        self.w_ks = nn.Linear(hidden_size, self.n_heads * self.key_size, bias=False)
        self.w_vs = nn.Linear(hidden_size, self.n_heads * self.value_size, bias=False)
        self.fc = nn.Linear(self.n_heads * self.value_size, hidden_size, bias=False)

        self.attn = ScaledDotProductAttention(temperature=self.key_size ** 0.5)

        self.dropout = nn.Dropout(dropout)
        self.norm = nn.LayerNorm(hidden_size, eps=1e-6)

    def forward(self, q, k, v):
        batch_size, len_q, len_k, len_v = q.size(0), q.size(1), k.size(1), v.size(1)
        residual = q

        # Seperate by heads
        q = self.w_qs(q).view(batch_size, len_q, self.n_heads, self.key_size)
        k = self.w_ks(k).view(batch_size, len_k, self.n_heads, self.key_size)
        v = self.w_vs(v).view(batch_size, len_v, self.n_heads, self.value_size)

        # Transpose for attention dot product
        q, k, v = q.transpose(1, 2), k.transpose(1, 2), v.transpose(1, 2)

        # Attention
        q, attn = self.attn(q, k, v)
        
        # Transpose to move the head dimension back
        q = q.transpose(1, 2).contiguous().view(batch_size, len_q, -1)
        q = self.dropout(self.fc(q))
        q = self.norm(residual + q)
        
        return q, attn


class OsuClassifier(nn.Module):
    """ Classifier for osu! beatmaps """
    def __init__(self, map_info_features: int, hit_objects_features: int, slider_points_features: int,
                num_classes: int, hidden_size: int=256, key_size: int=32, value_size: int=32, n_layers: int=2, 
                attn_n_layers: int=2, bidirectional: bool=False, dropout: float=0.5) -> None:
        super(OsuClassifier, self).__init__()
        self.map_info_features = map_info_features
        self.hit_objects_features = hit_objects_features
        self.slider_points_features = slider_points_features
        self.num_classes = num_classes
        self.hidden_size = hidden_size
        self.key_size = key_size
        self.value_size = value_size
        self.n_layers = n_layers
        self.attn_n_layers = attn_n_layers
        self.bidirectional = bidirectional
        self.dropout = dropout
        self.n_heads = 2

        # Attention Mechanism
        self.ho_attn_stack = nn.ModuleList([
            MultiHeadAttention(
                self.n_heads, 
                hidden_size=self.hidden_size, 
                key_size=self.key_size,
                value_size=self.value_size,
                dropout=self.dropout
            ) for _ in range(self.attn_n_layers)
        ])
        self.ho_attn_w = nn.Parameter(torch.randn(1, self.hidden_size, 1))
        self.sp_attn_stack = nn.ModuleList([
            MultiHeadAttention(
                self.n_heads,
                hidden_size=self.hidden_size,
                key_size=self.key_size,
                value_size=self.value_size,
                dropout=self.dropout
            ) for _ in range(self.attn_n_layers)
        ])
        self.sp_attn_w = nn.Parameter(torch.randn(1, self.hidden_size, 1))

        # RNN Layers
        self.hit_objects_rnn = nn.GRU(
            input_size=self.hit_objects_features,
            hidden_size=self.hidden_size,
            num_layers=self.n_layers,
            bidirectional=self.bidirectional,
            dropout=self.dropout,
            batch_first=True
        )
        self.slider_points_rnn = nn.GRU(
            input_size=self.slider_points_features,
            hidden_size=self.hidden_size,
            num_layers=self.n_layers,
            bidirectional=self.bidirectional,
            dropout=self.dropout,
            batch_first=True
        )

        # FC Layers
        self.hit_objects_fc = nn.Linear(self.hidden_size, self.hidden_size)
        self.slider_points_fc = nn.Linear(self.hidden_size, self.hidden_size)
        self.intermediate_fc = nn.Linear(self.map_info_features+self.hidden_size*2, self.hidden_size)
        self.out = nn.Linear(self.hidden_size, self.num_classes)

        # Regularization Layers
        self.norm1 = nn.LayerNorm(self.hidden_size)
        self.norm2 = nn.LayerNorm(self.hidden_size)
        self.norm3 = nn.LayerNorm(self.hidden_size)
    
    def self_attention(self, x, w):
        direction = 2 if self.bidirectional else 1
        batch_size, _, _ = x.size()

        # Transform the input
        x = x.view(batch_size, -1, direction, self.hidden_size)
        x = x.sum(dim=2)

        # Apply the attention weight
        attn = torch.bmm(torch.tanh(x), w.repeat(batch_size, 1, 1))
        attn = F.softmax(attn, dim=1)
        attn = torch.bmm(x.transpose(1, 2), attn).squeeze(2)
        return torch.tanh(attn)
    
    def forward(self, map_info, hit_objects, slider_points, seq_ho, seq_sp, return_attn=False):
        batch_size = hit_objects.size(0)

        # Hit Objects
        # Pack the padded hit objects
        hit_objects = nn.utils.rnn.pack_padded_sequence(
            hit_objects, seq_ho,
            batch_first=True, enforce_sorted=False
        )
        # Forward pass through the RNN
        hit_objects, _ = self.hit_objects_rnn(hit_objects)
        # Unpack the output
        hit_objects, _ = nn.utils.rnn.pad_packed_sequence(
            hit_objects, batch_first=True
        )

        # Slider Points
        # Pack the padded slider points
        slider_points = nn.utils.rnn.pack_padded_sequence(
            slider_points, seq_sp,
            batch_first=True, enforce_sorted=False
        )
        # Forward pass through the RNN
        slider_points, _ = self.slider_points_rnn(slider_points)
        # Unpack the output
        slider_points, _ = nn.utils.rnn.pad_packed_sequence(
            slider_points, batch_first=True
        )

        # Attention mechanism
        for ho_layer in self.ho_attn_stack:
            hit_objects, _ = ho_layer(hit_objects, hit_objects, hit_objects)
        for sp_layer in self.sp_attn_stack:
            slider_points, _ = sp_layer(slider_points, slider_points, slider_points)

        # Forward pass through the FC layers
        hit_objects = self.norm1(F.relu(self.hit_objects_fc(hit_objects).mean(dim=1)))
        slider_points = self.norm2(F.relu(self.slider_points_fc(slider_points).mean(dim=1)))

        # # Concatenate the map info and the RNN outputs
        out = torch.cat((map_info, hit_objects, slider_points), dim=1)
        out = self.norm3(F.relu(self.intermediate_fc(out)))

        # Final output
        return torch.sigmoid(self.out(out))
