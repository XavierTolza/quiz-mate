import React, { Component } from "react";
import { Button, Container, Form, InputGroup, Row } from "react-bootstrap";

import { toLetter } from "../../utilities";

import CheckBox from "../../assets/icons/check_box.svg";
import CheckBoxOutlineBlank from "../../assets/icons/check_box_outline_blank.svg";
import ImageIcon from "../../assets/icons/image.svg";

import "../../assets/icons/material-ui-icon.css";
import "./QuestionEditor.css";

const MAX_ANSWERS = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

class QuestionEditor extends Component {

    constructor(props) {
        super(props);
        this.onQuestionTextChange = this.onQuestionTextChange.bind(this);
        this.onImageChange = this.onImageChange.bind(this);
        this.removeImage = this.removeImage.bind(this);
    }

    onQuestionTextChange(event) {
        this.updateQuestion(event.target.value);
    }

    updateQuestion(value) {
        this.props.update({
            ...this.props.question,
            question: value,
        });
    }

    setCorrectAnswerIndex(value) {
        this.props.update({
            ...this.props.question,
            correct: value,
        });
    }

    updateAnswer(index, value) {
        const newData = this.props.question.answers.slice();
        newData[index] = value;
        this.props.update({
            ...this.props.question,
            answers: newData,
        });
    }

    onImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > MAX_IMAGE_SIZE) {
                alert("La taille de l'image doit être inférieure à 5 Mo");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                this.props.update({
                    ...this.props.question,
                    imageUrl: reader.result,
                });
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.props.update({
            ...this.props.question,
            imageUrl: null,
        });
    }

    getMarkCorrectAnswerCallback(index) {
        return () => this.setCorrectAnswerIndex(index);
    }

    getUpdateAnswerCallback(index) {
        return (event => this.updateAnswer(index, event.target.value));
    }

    answerBox(answer) {
        return (
            <Row key={answer}>
                <div className="answer-row">
                    <InputGroup>
                        <Button variant="secondary" onClick={this.getMarkCorrectAnswerCallback(answer)}>
                            <img src={answer === this.props.question.correct ? CheckBox : CheckBoxOutlineBlank}
                                className="material-ui-icon answer-checkbox"
                                alt="Marquer comme bonne réponse" />
                            <span className="answer-letter">{toLetter(answer)}</span>
                        </Button>
                        <Form.Control type="text"
                            value={this.props.question.answers[answer]}
                            className={
                                "editor-text-box"
                                + (answer === this.props.question.correct ? ' editor-text-box-correct' : '')
                            }
                            onChange={this.getUpdateAnswerCallback(answer)}
                            maxLength="120" />
                    </InputGroup>
                </div>
            </Row>
        );
    }

    renderAnswerBoxes() {
        const answerBoxes = [];
        for (let index = 0; index < MAX_ANSWERS; index++) {
            answerBoxes.push(this.answerBox(index));
        }
        return answerBoxes;
    }

    renderImageSection() {
        const { question } = this.props;
        return (
            <Row className="image-section">
                <div className="image-controls">
                    <InputGroup>
                        <Button variant="secondary" as="label" htmlFor="image-upload">
                            <img src={ImageIcon} className="material-ui-icon" alt="Importer une image" />
                            <span>Importer une Image</span>
                        </Button>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={this.onImageChange}
                            style={{ display: 'none' }}
                        />
                        {question.imageUrl && (
                            <Button variant="danger" onClick={this.removeImage}>
                                Supprimer l'Image
                            </Button>
                        )}
                    </InputGroup>
                </div>
                {question.imageUrl && (
                    <div className="image-preview">
                        <img src={question.imageUrl} alt="Image de la question" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                    </div>
                )}
            </Row>
        );
    }

    render() {
        if (this.props.question) {
            return (
                <Container fluid className="question-editor-container">
                    <Row>
                        <Form.Control
                            as="textarea"
                            value={this.props.question.question}
                            className="editor-textarea"
                            onChange={this.onQuestionTextChange}
                            placeholder="Question"
                            maxLength="200"
                        />
                    </Row>
                    {this.renderImageSection()}
                    {this.renderAnswerBoxes()}
                </Container>
            );
        } else {
            return (
                <div style={{ margin: '40px auto 0 10px', textAlign: "left", fontSize: "1.2rem" }}>
                    <p>Utilisez cet éditeur pour créer ou modifier un quiz :</p>
                    <ul>
                        <li>Importez un quiz (si vous en avez un)</li>
                        <li>Utilisez les boutons ci-dessus pour ajouter des questions</li>
                        <li>Changez entre les questions sur le côté gauche</li>
                    </ul>
                    <p>Les quiz ne sont PAS sauvegardés sur le serveur !</p>
                    <p style={{ color: "red", fontWeight: "bold" }} >Vous devez télécharger le quiz une fois terminé.</p>
                </div>
            );
        }
    }
}

export default QuestionEditor;
