import { TEN } from "./constants";

//----------------------------------------------------------------------------------------------------------------------
// A sample quiz
//----------------------------------------------------------------------------------------------------------------------

export const SAMPLE_QUIZ = {
    "title": "Quiz exemple",
    "questions": [
        {
            "question": "Quel continent n'a qu'un seul pays ?",
            "correct": 2,
            "answers": [
                "Afrique",
                "Asie",
                "Australie",
                "Amérique du Sud"
            ]
        },
        {
            "question": "Quel légume donne sa force à Popeye ?",
            "correct": 3,
            "answers": [
                "Asperge",
                "Brocoli",
                "Lentilles",
                "Épinards"
            ]
        },
        {
            "question": "Le chef de quel pays réside au 10 Downing Street ?",
            "correct": 3,
            "answers": [
                "Brésil",
                "Canada",
                "Nigeria",
                "Royaume-Uni"
            ]
        }
    ]
};

//----------------------------------------------------------------------------------------------------------------------
// Uplift a quiz to the latest format and validate that it's correct
//----------------------------------------------------------------------------------------------------------------------

export function upliftAndValidate(quiz, filename) {
    if (quiz && "object" === typeof quiz) {
        const upliftedQuiz = upliftQuiz(quiz, (filename || "Quiz").replace(/\.json$/i, ""));
        validateQuiz(upliftedQuiz);
        return upliftedQuiz;
    } else {
        return fail();
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Uplift the quiz to the latest format
//----------------------------------------------------------------------------------------------------------------------

export function upliftQuiz(quiz, filename) {
    if (Array.isArray(quiz)) {
        quiz = { title: filename, questions: quiz };
    }
    quiz.title = quiz.title.trim();
    quiz.title ||= filename;
    quiz.questions ||= [];
    return quiz;
}

//----------------------------------------------------------------------------------------------------------------------
// Validate a quiz
//----------------------------------------------------------------------------------------------------------------------

export function validateQuiz(quiz) {
    validateTitle(quiz);
    validateQuestions(quiz);
};

//----------------------------------------------------------------------------------------------------------------------
// Validate the quiz title
//----------------------------------------------------------------------------------------------------------------------

function validateTitle(quiz) {
    if (!Object.prototype.hasOwnProperty.call(quiz, "title")) {
        fail("Le quiz n'a pas de titre");
    }
    if ("string" !== typeof quiz.title) {
        fail(`Le titre a un type de données incorrect (${typeof quiz.title} au lieu de string)`);
    }
    if (!quiz.title.trim()) {
        fail("Le titre est vide");
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Validate the questions array
//----------------------------------------------------------------------------------------------------------------------

function validateQuestions(quiz) {
    if (!Object.prototype.hasOwnProperty.call(quiz, "questions")) {
        fail("Le quiz n'a pas de questions");
    }
    if (!Array.isArray(quiz.questions)) {
        fail("Les questions ne sont pas un tableau");
    }
    if (!quiz.questions.length) {
        fail("Le quiz ne contient aucune question");
    }
    quiz.questions.forEach(validateQuestion);
}

//----------------------------------------------------------------------------------------------------------------------
// Validate a single question
//----------------------------------------------------------------------------------------------------------------------

function validateQuestion(question, index) {
    const questionNumber = toOrdinal(index);

    if (!question || "object" !== typeof question || Array.isArray(question)) {
        fail(`La ${questionNumber} question a un format invalide (ce n'est pas un objet)`);
    }
    const questionReference = "string" === typeof question.question && question.question.trim()
        ? `question "${question.question.trim()}"`
        : `la ${questionNumber} question`;
    if ("string" !== typeof question.question || !question.question.trim()) {
        fail(`${capitalize(questionReference)} n'a pas de texte de question`);
    }
    validateAnswers(questionReference, question.answers);
    validateCorrect(questionReference, question);
}

//----------------------------------------------------------------------------------------------------------------------
// Validate answers
//----------------------------------------------------------------------------------------------------------------------

function validateAnswers(questionReference, answers) {
    if (!answers || (Array.isArray(answers) && !answers.length)) {
        fail(`${capitalize(questionReference)} n'a pas de réponses`);
    }
    if (!Array.isArray(answers)) {
        fail(`Les réponses pour ${questionReference} ont un type invalide (${typeof answers} au lieu de tableau)`);
    }
    answers.forEach((answer, index) => {
        const answerReference = "string" === typeof answer && answer.trim()
            ? `Réponse "${answer.trim()}" pour ${questionReference}`
            : `La ${toOrdinal(index)} réponse pour ${questionReference}`;
        if ("string" !== typeof answer) {
            fail(`${answerReference} a un type invalide (${typeof answer} au lieu de string)`);
        }
        if (!answer.trim()) {
            fail(`${answerReference} est vide`);
        }
    });
}

//----------------------------------------------------------------------------------------------------------------------
// Validate the correct answer pointer
//----------------------------------------------------------------------------------------------------------------------

function validateCorrect(questionReference, question) {
    if (!Object.prototype.hasOwnProperty.call(question, "correct")) {
        fail(`${capitalize(questionReference)} n'a pas la propriété "correct"`);
    }
    if ("number" !== typeof question.correct) {
        fail([
            `La propriété "correct" de ${questionReference} a un type invalide`,
            `(${typeof question.correct} au lieu de number)`
        ].join(" "));
    }
    if (question.correct < 0) {
        fail(`La propriété "correct" de ${questionReference} est inférieure à zéro (valeur : ${question.correct})`);
    }
    if (question.answers.length < question.correct) {
        fail([
            `${capitalize(questionReference)} n'a que ${question.answers.length} réponses`,
            ` mais marque la ${toOrdinal(question.correct)} comme la bonne`
        ].join(" "));
    }
}

//----------------------------------------------------------------------------------------------------------------------
// Throw an exception with the given message
//----------------------------------------------------------------------------------------------------------------------

function fail(message) {
    throw new Error(message);
}

//----------------------------------------------------------------------------------------------------------------------
// Format an ordinal number
//----------------------------------------------------------------------------------------------------------------------

function toOrdinal(index) {
    const number = index + 1;
    const suffix = ["th", "st", "nd", "rd"][number % TEN] || "th";
    return `${number}${suffix}`;
}

//----------------------------------------------------------------------------------------------------------------------
// Capitalize the first letter
//----------------------------------------------------------------------------------------------------------------------

function capitalize(text) {
    return text.trim().length ? text.trim().substr(0, 1).toUpperCase() + text.trim().substr(1) : text;
}
