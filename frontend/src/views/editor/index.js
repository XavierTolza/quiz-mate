import fileDownload from 'js-file-download';
import { Component, createRef } from 'react';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import CenterBox from "../../components/CenterBox";
import QuestionEditor from "../../components/QuestionEditor";
import QuestionExplorer from "../../components/QuestionExplorer";
import { upliftQuiz, validateQuiz } from "../../utilities/quiz-data";

import AddBox from "../../assets/icons/add_box.svg";
import ArrowDownward from "../../assets/icons/arrow_downward.svg";
import ArrowUpward from "../../assets/icons/arrow_upward.svg";
import Close from "../../assets/icons/close.svg";
import DeleteForever from "../../assets/icons/delete_forever.svg";
import GetApp from "../../assets/icons/get_app.svg";
import Publish from "../../assets/icons/publish.svg";

import "../../assets/icons/material-ui-icon.css";
import './Editor.css';

const SPACE_PER_TAB = 4;

class Editor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            originalName: '',
            workspace: [],
            title: '',
            selectedIndex: -1,
            changed: false,
            exitModal: false,
            deleteModal: false,
            uploadModal: false,
            downloadModal: false,
            downloadModalMessage: undefined
        };
        this.inputFile = createRef();
        this.onTitleChange = this.onTitleChange.bind(this);
        this.changeSelection = this.changeSelection.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.hideExitModal = this.hideExitModal.bind(this);
        this.navigateToStartPage = this.navigateToStartPage.bind(this);
        this.hideDeleteModal = this.hideDeleteModal.bind(this);
        this.deleteQuestionWithoutConfirmation = this.deleteQuestionWithoutConfirmation.bind(this);
        this.deleteQuestion = this.deleteQuestion.bind(this);
    }

    onTitleChange(event) {
        this.setState({ title: event.target.value, changed: true });
    }

    hideExitModal() {
        this.setState({ exitModal: false });
    }

    navigateToStartPage() {
        this.props.navigate('/');
    }

    hideDeleteModal() {
        this.setState({ deleteModal: false });
    }

    changeSelection(index) {
        this.setState({
            selectedIndex: index
        });
    };

    exitButton = () => {
        if (this.state.changed) {
            this.setState({ exitModal: true });
        } else {
            this.props.navigate('/host');
        }
    };

    uploadFile() {
        if (this.state.changed) {
            this.setState({ uploadModal: true });
        } else {
            this.loadProject();
        }
    }

    cancelUpload = () => {
        this.setState({ uploadModal: false });
        this.inputFile.current.value = "";
    };

    cancelDownload = () => {
        this.setState({ downloadModal: false, downloadModalMessage: undefined });
    };

    loadProject = () => {
        this.setState({ uploadModal: false });
        const fr = new FileReader();
        fr.onload = e => {
            let config = null;
            config = upliftQuiz(JSON.parse(e.target.result));
            this.setState({ title: config.title, workspace: config.questions });
            this.inputFile.current.value = "";
        };
        if (this.inputFile.current.files.item(0)) {
            this.setState({
                originalName: this.inputFile.current.files.item(0).name,
                changed: false
            });
            fr.readAsText(this.inputFile.current.files.item(0));
        }
    };

    downloadButton = () => {
        try {
            validateQuiz(this.assembleDownloadableQuiz());
            this.downloadFile();
        } catch (error) {
            const downloadModalMessage = error instanceof Error ? error.message : `${error}`;
            this.setState({ downloadModal: true, downloadModalMessage });
        }
    };

    downloadFile = () => {
        this.setState({ downloadModal: false, downloadModalMessage: undefined });
        let name = this.state.originalName;
        if (name === "") {
            name = prompt("Entrez le nom du projet ou laissez le champ vide :");
            if (name === '') {
                name = 'questions.json';
            } else {
                name += '.json';
                this.setState({ originalName: name });
            }
        }
        const json = JSON.stringify(this.assembleDownloadableQuiz(), null, SPACE_PER_TAB);
        fileDownload(json, name);
        this.setState({ changed: false });
    };

    assembleDownloadableQuiz = () => ({ title: this.state.title, questions: this.state.workspace });

    moveQuestion = diff => {
        const oldIndex = this.state.selectedIndex;
        const newIndex = oldIndex + diff;
        const newData = this.state.workspace.slice();
        newData.splice(newIndex, 0, newData.splice(oldIndex, 1)[0]);
        this.setState({
            workspace: newData,
            selectedIndex: newIndex,
            changed: true
        });
    };

    deleteQuestion() {
        if (this.state.selectedIndex >= 0) {
            this.setState({ deleteModal: true });
        }
    };

    deleteQuestionWithoutConfirmation() {
        const newData = this.state.workspace.slice();
        newData.splice(this.state.selectedIndex, 1);
        let newIndex = this.state.selectedIndex;
        if (newIndex >= newData.length) {
            newIndex = newData.length - 1;
        }
        this.setState({
            deleteModal: false,
            workspace: newData,
            selectedIndex: newIndex,
            changed: true
        });
    }

    addQuestion = onCurrentIndex => {
        if (onCurrentIndex) {
            const newData = this.state.workspace.slice();
            newData.splice(this.state.selectedIndex + 1, 0, {
                question: '',
                correct: 0,
                answers: ['', '', '', '']
            });
            this.setState({
                workspace: newData,
                selectedIndex: this.state.selectedIndex + 1,
                changed: true
            });
        } else {
            this.setState({
                workspace: [...this.state.workspace, {
                    question: '',
                    correct: 0,
                    answers: ['', '', '', '']
                }],
                selectedIndex: this.state.workspace.length,
                changed: true
            });
        }
    };

    topButtonsConfig = () => [
        {
            text: "Quitter",
            icon: <img src={Close} className="material-ui-icon" alt="Fermer" />,
            click: this.exitButton
        },
        {
            customUpload: true,
            text: "Importer",
            icon: <img src={Publish} className="material-ui-icon" alt="Importer" />,
            click: this.uploadFile
        },
        {
            variant: this.state.workspace.length === 0 || !this.state.changed ? null : 'success',
            text: "Télécharger",
            icon: <img src={GetApp} className="material-ui-icon" alt="Télécharger" />,
            click: this.downloadButton,
            disabled: this.state.workspace.length === 0 || !this.state.changed
        },
        {
            text: "Monter",
            icon: <img src={ArrowUpward} className="material-ui-icon" alt="Monter" />,
            click: () => this.moveQuestion(-1),
            disabled: this.state.selectedIndex < 1
        },
        {
            text: 'Descendre',
            icon: <img src={ArrowDownward} className="material-ui-icon" alt="Descendre" />,
            click: () => this.moveQuestion(1),
            disabled: this.state.selectedIndex < 0 || this.state.selectedIndex + 1 === this.state.workspace.length
        },
        {
            text: 'Supprimer',
            icon: <img src={DeleteForever} className="material-ui-icon" alt="Supprimer" />,
            click: this.deleteQuestion,
            disabled: this.state.selectedIndex < 0
        },
        {
            text: 'Ajouter ici',
            icon: <img src={AddBox} className="material-ui-icon" alt="Ajouter ici" />,
            click: () => this.addQuestion(true)
        },
        {
            text: 'Ajouter à la fin',
            icon: <img src={AddBox} className="material-ui-icon" alt="Ajouter à la fin" />,
            click: () => this.addQuestion(false)
        }
    ];

    updateQuestion = data => {
        if (this.state.selectedIndex >= 0) {
            const newData = this.state.workspace.slice();
            newData[this.state.selectedIndex] = data;
            this.setState({
                workspace: newData,
                changed: true
            });
        }
    };

    render() {
        return (
            <CenterBox {...this.props}>
                <div className="message-box d-block d-sm-block d-md-none">
                    La résolution du navigateur est trop faible pour lancer l'éditeur de questions !
                </div>
                <Container fluid className="editor-container d-none d-sm-none d-md-block">
                    <Row style={{ height: '100%' }}>
                        <Col xl={4} lg={4} md={4} sm={12}>
                            <QuestionExplorer questions={this.state.workspace}
                                selectedIndex={this.state.selectedIndex}
                                selected={this.changeSelection} />
                        </Col>
                        <Col xl={8} lg={8} md={8} sm={12}>
                            <div className="question-editor">
                                <Container fluid>
                                    <Row style={{ padding: "20px 10px 20px 10px" }}>
                                        <Col lg={4} md={6} style={{ textAlign: "center" }}>
                                            Quiz titre :
                                        </Col>
                                        <Col lg={8} md={6}>
                                            <Form.Control
                                                as="input"
                                                value={this.state.title}
                                                onChange={this.onTitleChange}
                                                className={this.state.title ? '' : 'missing-title'}
                                                placeholder="Titre du Quiz"
                                                maxLength="200"
                                            />
                                        </Col>
                                    </Row>
                                    <Row>
                                        {
                                            this.topButtonsConfig().map(btn => {
                                                if (btn.customUpload) {
                                                    return (
                                                        <Col lg={4} md={6} key={btn.text}
                                                            className="editor-button-container">
                                                            <span className="btn btn-secondary btn-file editor-button">
                                                                {btn.icon}
                                                                {(btn.icon ? ' ' : '') + btn.text}
                                                                <input
                                                                    type="file"
                                                                    accept="application/json"
                                                                    onChange={this.uploadFile}
                                                                    ref={this.inputFile}
                                                                />
                                                            </span>
                                                        </Col>
                                                    );
                                                } else {
                                                    return (
                                                        <Col lg={4} md={6} key={btn.text}
                                                            className="editor-button-container">
                                                            <Button variant={btn.variant ? btn.variant : 'secondary'}
                                                                className="editor-button"
                                                                onClick={btn.click}
                                                                disabled={btn.disabled}>
                                                                {btn.icon}
                                                                {(btn.icon ? ' ' : '') + btn.text}
                                                            </Button>
                                                        </Col>
                                                    );
                                                }
                                            })
                                        }
                                    </Row>
                                    <Row>
                                        <QuestionEditor
                                            question={
                                                this.state.selectedIndex < 0
                                                    ? null
                                                    : this.state.workspace[this.state.selectedIndex]
                                            }
                                            update={this.updateQuestion} />
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                </Container>

                <Modal show={this.state.exitModal} onHide={this.hideExitModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attention</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Modifications non sauvegardées détectées dans le projet !<br />Êtes-vous sûr de vouloir quitter l'éditeur ?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.navigateToStartPage}>Oui, quitter</Button>
                        <Button variant="secondary" onClick={this.hideExitModal}>
                            Non, annuler
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.deleteModal} onHide={this.hideDeleteModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attention</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Êtes-vous sûr de vouloir supprimer cette question ?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.deleteQuestionWithoutConfirmation}>Oui, supprimer</Button>
                        <Button variant="secondary" onClick={this.hideDeleteModal}>
                            Non, annuler
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.uploadModal} onHide={this.cancelUpload}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attention</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Êtes-vous sûr de vouloir charger un nouveau projet ? Vous avez des modifications non sauvegardées dans le projet actuel !</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.loadProject}>Oui, importer le nouveau projet</Button>
                        <Button variant="secondary" onClick={this.cancelUpload}>Non, annuler</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.downloadModal} onHide={this.cancelDownload}>
                    <Modal.Header closeButton>
                        <Modal.Title>Attention</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {this.state.downloadModalMessage}.
                        </p>
                        <p>
                            Voulez-vous quand même télécharger le quiz ?
                            Vous pourrez le réimporter et continuer à l'éditer plus tard -
                            mais vous ne pourrez pas l'héberger.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.downloadFile}>Oui, télécharger quand même</Button>
                        <Button variant="secondary" onClick={this.cancelDownload}>Non, annuler</Button>
                    </Modal.Footer>
                </Modal>
            </CenterBox>
        );
    }
}

const EditorWithNavigate = props => (<Editor {...props} navigate={useNavigate()} />);

export default EditorWithNavigate;
