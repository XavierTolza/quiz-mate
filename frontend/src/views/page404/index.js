import { Component } from "react";

import CenterBox from "../../components/CenterBox";

class Page404 extends Component {

    render() {
        return (
            <CenterBox logo cancel="Retour au menu" {...this.props}>
                <div className="message-box">
                    <div style={{ fontSize: "4em" }}>404</div>
                    Page non trouvée !
                </div>
            </CenterBox>
        );
    }
}

export default Page404;
