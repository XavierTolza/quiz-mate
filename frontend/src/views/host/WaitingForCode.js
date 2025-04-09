import React, { Component } from "react";

import CenterBox from "../../components/CenterBox";

class WaitingForCode extends Component {
    render() {
        return (
            <CenterBox logo cancel="Retour" {...this.props}>
                <div className="message-box">
                    <p>Création de la salle...</p>
                </div>
            </CenterBox>
        );
    }
}

export default WaitingForCode;
