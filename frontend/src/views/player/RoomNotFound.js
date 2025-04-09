import { Component } from "react";
import CenterBox from "../../components/CenterBox";

import Warning from "../../assets/icons/warning.svg";

import "../../assets/icons/material-ui-icon.css";

class RoomNotFound extends Component {
    render() {
        return (
            <CenterBox logo cancel="Retour au menu" {...this.props}>
                <img src={Warning} className="material-ui-icon" style={{ fontSize: "4.5em" }} alt="Add" />
                <div className="message-box">
                    La salle avec le code {this.props.game.roomCode} n'a pas été trouvée !
                </div>
            </CenterBox>
        );
    }
}

export default RoomNotFound;
