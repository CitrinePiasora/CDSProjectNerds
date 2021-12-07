import torch
from torch import nn
from torch.nn import functional as F


class OsuClassifier(nn.Module):
    """
    Classifier for osu! beatmaps.
    """
    def __init__(self, map_info_features: int, hit_objects_features: int,
                slider_points_features: int, num_classes: int, hidden_size: int=256,
                num_layers: int=2, bidirectional: bool=False, dropout: float=0.5) -> None:
        super(OsuClassifier, self).__init__()
        self.map_info_features = map_info_features
        self.hit_objects_features = hit_objects_features
        self.slider_points_features = slider_points_features
        self.num_classes = num_classes
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.bidirectional = bidirectional
        self.dropout = dropout

        # Attention Weight
        self.ho_attn_w = nn.Parameter(torch.randn(1, self.hidden_size, 1))
        self.sp_attn_w = nn.Parameter(torch.randn(1, self.hidden_size, 1))

        # RNN Layers
        self.hit_objects_rnn = nn.GRU(
            input_size=self.hit_objects_features,
            hidden_size=self.hidden_size,
            num_layers=self.num_layers,
            bidirectional=self.bidirectional,
            dropout=self.dropout,
            batch_first=True
        )
        self.slider_points_rnn = nn.GRU(
            input_size=self.slider_points_features,
            hidden_size=self.hidden_size,
            num_layers=self.num_layers,
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
        self.bn1 = nn.BatchNorm1d(self.hidden_size)
        self.bn2 = nn.BatchNorm1d(self.hidden_size)
        self.bn3 = nn.BatchNorm1d(self.hidden_size)
    
    def self_attention(self, x, w):
        """
        Self-Attention mechanism for the RNN.
        https://arxiv.org/abs/1706.03762
        """
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
    
    def forward(self, map_info, hit_objects, slider_points, seq_ho, seq_sp):
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
        hit_objects = self.self_attention(hit_objects, self.ho_attn_w)
        slider_points = self.self_attention(slider_points, self.sp_attn_w)

        # Forward pass through the FC layers
        hit_objects = self.bn1(F.relu(self.hit_objects_fc(hit_objects)))
        slider_points = self.bn2(F.relu(self.slider_points_fc(slider_points)))

        # Concatenate the map info and the RNN outputs
        out = torch.cat((map_info, hit_objects, slider_points), dim=1)
        out = self.bn3(F.relu(self.intermediate_fc(out)))

        # Final output
        return torch.sigmoid(self.out(out))
