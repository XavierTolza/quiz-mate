import { Component, createRef } from "react";
import { Container, Form } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";

import { setPlayerConfigAC, switchStateAC } from "../../actions/game";
import CenterBox from "../../components/CenterBox";
import IconButton from "../../components/IconButton";
import { isValidRoomCode } from "../../utilities";

import EmojiPeople from "../../assets/icons/emoji_people.svg";

class JoinPresenter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: props.prefilledCode || "",
        };
        this.roomCodeReference = createRef();
        this.onInputFieldKeyEvent = this.onInputFieldKeyEvent.bind(this);
        this.changeRoomCode = this.changeRoomCode.bind(this);
        this.joinSession = this.joinSession.bind(this);
    }

    componentDidMount() {
        this.props.switchState("");
        this.props.setPlayerConfig("", "", false);

        if (this.props.prefilledCode && this.props.autoJoin && isValidRoomCode(this.props.prefilledCode)) {
            // Auto-join avec le code fourni
            this.joinSession();
        } else if (isValidRoomCode(this.props.roomCode)) {
            this.setState({ roomCode: `${this.props.roomCode}` }, () => this.roomCodeReference.current.focus());
        } else {
            this.roomCodeReference.current.focus();
        }
    }

    onInputFieldKeyEvent(event) {
        if (event.key === "Enter" && isValidRoomCode(this.state.roomCode)) {
            this.joinSession();
        }
    }

    changeRoomCode(event) {
        this.setState({ roomCode: event.target.value });
    }

    joinSession() {
        if (this.state.roomCode !== "") {
            this.props.setPlayerConfig(
                this.state.roomCode,
                "",
                false
            );
            this.props.navigate("/presenter/view");
        }
    }

    render() {
        return (
            <CenterBox>
                <Container fluid>
                    <div className="message-box">
                        <h2 style={{marginBottom: "30px"}}>Join as Presenter</h2>
                        <form>
                            <Form.Control
                                type="number"
                                value={this.state.roomCode}
                                onChange={this.changeRoomCode}
                                ref={this.roomCodeReference}
                                onKeyPress={this.onInputFieldKeyEvent}
                                placeholder="6-digit access code"
                                className="main-input-field equal-width"
                            />
                            <IconButton
                                disabled={!isValidRoomCode(this.state.roomCode)}
                                icon={EmojiPeople}
                                variant="warning"
                                label="Join as Presenter"
                                buttonClassName="equal-width"
                                buttonStyle={{ width: "100%", maxWidth: "18rem" }}
                                onClick={this.joinSession}
                            />
                        </form>
                    </div>
                </Container>
            </CenterBox>
        );
    }
}

const mapStateToProps = state => ({
    game: state.game
});

const mapDispatchToProps = dispatch => ({
    switchState: (...args) => dispatch(switchStateAC(...args)),
    setPlayerConfig: (...args) => dispatch(setPlayerConfigAC(...args))
});

const ConnectedJoinPresenter = connect(mapStateToProps, mapDispatchToProps)(JoinPresenter);

const ConnectedJoinPresenterWithRouter = props => {
    const navigate = useNavigate();
    const location = useLocation();
    return <ConnectedJoinPresenter {...props} navigate={navigate} location={location} />;
};

export default ConnectedJoinPresenterWithRouter;