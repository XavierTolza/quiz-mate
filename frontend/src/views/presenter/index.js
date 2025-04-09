import { Component } from "react";
import { connect } from "react-redux";
import socketIOClient from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";
import { getServerJoinUrl } from "../../utilities";

import { setHostingRoomAC, switchStateAC } from "../../actions/game";
import {
    addToRoom,
    answersClose,
    answersOpen,
    answerStatsResponse,
    gameCompleted,
    generalRankingResponse,
    joinedToRoom,
    presenterTabSync,
    roomNotFound,
    server,
    timerSync
} from "../../connection/config";
import CenterBox from "../../components/CenterBox";
import RankTable from "../../components/RankTable";
import LoadingRoom from "../player/LoadingRoom";
import RoomNotFound from "../player/RoomNotFound";
import { V_LOADING_ROOM, V_ROOM_NOT_FOUND, V_WAITING, V_QUESTION, V_FINAL } from "../player/views";
import { TAB_REVEAL_ANSWER, TAB_ANSWER_STATS, TAB_LEADERBOARD } from "../host/Question";
import { toLetter } from "../../utilities";
import { ONE_HUNDRED } from "../../utilities/constants";
import { Col, Container, ProgressBar, Row } from "react-bootstrap";

import "./Presenter.css";

class Presenter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question: null,
            timerValue: 0,
            isOpen: true,
            answerStats: null,
            generalRanking: null,
            questionTab: 0,
            revealAnswer: false,
            revealStats: false
        };
    }

    componentDidMount() {
        this.props.switchState(V_LOADING_ROOM);
        if (this.props.game.roomCode) {
            this.socket = socketIOClient(server, { closeOnBeforeunload: false });

            this.socket.on('connect', () => this.socket.emit(
                addToRoom, this.props.game.roomCode, 'presenter', false
            ));

            this.socket.on(roomNotFound, () => {
                this.props.switchState(V_ROOM_NOT_FOUND);
            });

            this.socket.on(joinedToRoom, roomObject => {
                this.props.setHostingRoom(roomObject);
                this.props.switchState(V_WAITING);
            });

            this.socket.on(answersOpen, question => {
                this.setState({
                    question: question,
                    isOpen: true,
                    timerValue: this.props.game.hostingRoom.timeLimit,
                    questionTab: 0,
                    revealAnswer: false,
                    revealStats: false,
                    answerStats: null,
                    generalRanking: null
                });
                this.props.switchState(V_QUESTION);
            });

            this.socket.on(answersClose, question => {
                this.setState({ 
                    question: question,
                    isOpen: false
                });
            });

            this.socket.on(timerSync, value => this.setState({ timerValue: value }));

            this.socket.on(answerStatsResponse, stats => {
                this.setState({ answerStats: stats });
            });

            this.socket.on(generalRankingResponse, ranking => {
                this.setState({ generalRanking: ranking });
            });

            this.socket.on(gameCompleted, stats => {
                this.setState({ generalRanking: stats });
                this.props.switchState(V_FINAL);
            });

            this.socket.on(presenterTabSync, (tab) => {
                this.setState({ 
                    questionTab: tab,
                    revealAnswer: tab === TAB_REVEAL_ANSWER,
                    revealStats: tab === TAB_ANSWER_STATS 
                });
            });
        }
    }

    componentWillUnmount() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    StatProgressBar(answer) {
        if (!this.state.revealStats) {
            return false;
        }
        
        let value = 0;
        if (this.state.answerStats && this.state.answerStats[answer] > 0) {
            const totalAnswers = this.state.answerStats.reduce((a, b) => a + b, 0);
            if (totalAnswers > 0) {
                value = Math.round(this.state.answerStats[answer] * ONE_HUNDRED / totalAnswers);
            }
        }
        return (<ProgressBar 
            now={value} 
            label={`${this.state.answerStats ? this.state.answerStats[answer] : 0} votes (${value}%)`}
            className="question-progress" 
        />);
    }

    correctGreenBox(answer) {
        const isRevealAnswerTab = this.state.questionTab === TAB_REVEAL_ANSWER;
        const isCorrectAnswer = this.state.question.correct === answer;
        const mustRevealAnswer = (isRevealAnswerTab || this.state.revealAnswer) && isCorrectAnswer;
        return mustRevealAnswer ? " question-answer-correct" : "";
    }

    renderAnswer(answer, index) {
        return (
            <Col md={6} sm={12} key={index}>
                <div className={"question-answer" + this.correctGreenBox(index)}>
                    <div className="question-answer-letter">{toLetter(index)}</div>
                    {answer}
                    {this.StatProgressBar(index)}
                </div>
            </Col>
        );
    }

    QuestionGrid() {
        const { question } = this.state;
        return (
            <div>
                <Row>
                    <Col xs={12}>
                        <div className="question-question">
                            {question.question}
                            {question.imageUrl && (
                                <div className="question-image">
                                    <img src={question.imageUrl} alt="Question" />
                                </div>
                            )}
                        </div>
                    </Col>
                    {question.answers.map((answer, index) => this.renderAnswer(answer, index))}
                </Row>
            </div>
        );
    }

    renderLeaderboard() {
        if (this.state.questionTab === TAB_LEADERBOARD && this.state.generalRanking) {
            return <RankTable data={this.state.generalRanking} showHeader={false} />;
        }
        return false;
    }

    renderQuestion() {
        const { question } = this.state;
        if (!question || this.state.questionTab === TAB_LEADERBOARD) return null;

        return (
            <Container fluid>
                {this.QuestionGrid()}
            </Container>
        );
    }

    render() {
        switch (this.props.game.state) {
            case V_LOADING_ROOM:
                return <LoadingRoom {...this.props} />;
            case V_ROOM_NOT_FOUND:
                return <RoomNotFound {...this.props} />;
            case V_WAITING:
                const joinUrl = getServerJoinUrl(this.props.game.hostingRoom.roomCode);
                return (
                    <CenterBox>
                        <div className="message-box">
                            <div style={{ textAlign: 'center' }}>
                                <h3>Scan to join the quiz</h3>
                                <div style={{ marginTop: '20px' }}>
                                    <QRCodeCanvas 
                                        value={joinUrl}
                                        size={300}
                                        includeMargin
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                    />
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <h4>Room code: {this.props.game.hostingRoom.roomCode}</h4>
                                </div>
                                <h3>
                                    {joinUrl}
                                </h3>
                            </div>
                        </div>
                    </CenterBox>
                );
            case V_QUESTION:
            case V_WAITING:
                return (
                    <CenterBox>
                        <div className="presenter-view">
                            {this.renderQuestion()}
                            {this.renderLeaderboard()}
                        </div>
                    </CenterBox>
                );
            case V_FINAL:
                return (
                    <CenterBox>
                        <div className="message-box">
                            Quiz completed!
                            {this.state.generalRanking && (
                                <div className="final-leaderboard">
                                    <RankTable data={this.state.generalRanking} showHeader={true} />
                                </div>
                            )}
                        </div>
                    </CenterBox>
                );
            default:
                return <div>Unknown state</div>;
        }
    }
}

const mapStateToProps = state => ({
    game: state.game
});

const mapDispatchToProps = dispatch => ({
    switchState: (...args) => dispatch(switchStateAC(...args)),
    setHostingRoom: (...args) => dispatch(setHostingRoomAC(...args))
});

export default connect(mapStateToProps, mapDispatchToProps)(Presenter);