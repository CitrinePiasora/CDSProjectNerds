import { ReactElement } from "react"
import { MediaContainer, TextContainer, Typography, Divider } from "react-md"


export default function NavHeader(): ReactElement {
    return (
        <>
            <MediaContainer style={{ width: "50%", margin: "auto", paddingTop: "15%" }}>
                <img
                    src="https://i.ppy.sh/84650abbb8bc7fcbfa58f6941ac6c2d00ef4a5bd/68747470733a2f2f6f73752e7070792e73682f77696b692f696d616765732f4272616e645f6964656e746974795f67756964656c696e65732f696d672f75736167652d73696e676c652d636f6c6f75722e706e67"
                />
            </MediaContainer>
            <TextContainer>
                <Typography align="center" type="subtitle-1">osu! Beatmap Classifier</Typography>
            </TextContainer>
            <Divider />
        </>
    );
}