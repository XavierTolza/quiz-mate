import { Component } from "react";
import CenterBox from "../../components/CenterBox";

class LoadingRoom extends Component {
    render() {
        return (
            <CenterBox cancel="Retour au menu" {...this.props}>
                <div className="message-box">
                    Recherche de la salle...
                </div>
            </CenterBox>
        );
    }
}

export default LoadingRoom;
