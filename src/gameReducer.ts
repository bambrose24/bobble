import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/types/types-external'
import { text } from './words'
import { scrabble } from './scrabbleFives'
import ReactGA from 'react-ga4'

const answerWords = text.filter(w => w !== 'goose' && w !== 'ziggy')
const answerWordsSet = new Set(answerWords)
const scrabbleWords = new Set(scrabble.split("\n").filter(w => w !== 'goose' && w !== 'ziggy'))

export type Guess = {
    word: string
}

export type Game = {
    answer: string,
    currentGuess: string,
    isCurrentGuessInvalid: boolean,
    previousGuesses: Array<string>,
}


export const done = (game: Game): boolean => {
    const guessCount = game.previousGuesses.length
    return guessCount >= 6 || didWin(game)
}

export const didWin = (game: Game): boolean => {
    const guessCount = game.previousGuesses.length
    return guessCount > 0 && game.previousGuesses[guessCount - 1] === game.answer
}

export const canMakeGuess = (game: Game, guess: string): boolean => {
    return !game.previousGuesses.includes(guess) && (scrabbleWords.has(guess) || answerWordsSet.has(guess))
}

export type Preferences = {
    paletteMode: "light" | "dark",
}

export type AnimationData = {
    shouldAnimateLastGuess: boolean,
}

export type UserState = {
    games: Array<Game>,
    preferences: Preferences,
    animationData: AnimationData,
}

export const currentGame = (userState: UserState): Game | null => {
    const gameCount = userState.games.length
    if (gameCount > 0) {
        return userState.games[gameCount - 1]
    }
    return null
}

const initialState: UserState = {
    games: [],
    preferences: {
        paletteMode: "dark"
    },
    animationData: {
        shouldAnimateLastGuess: false,
    }
}

const alterGuess = (state: WritableDraft<UserState>, letterToAdd: string | null): WritableDraft<UserState> => {
    const currGame = currentGame(state)
    if (!currGame || done(currGame)) {
        return state
    }
    const currGuess = currGame.currentGuess

    if (letterToAdd === null && currGuess.length === 0) {
        return state
    } else if (letterToAdd !== null && currGuess.length >= 5) {
        return state
    }

    const newGuess = letterToAdd !== null ? currGuess + letterToAdd : currGuess.slice(0, currGuess.length - 1)

    const newGame = {
        answer: currGame.answer,
        currentGuess: newGuess,
        isCurrentGuessInvalid: false,
        previousGuesses: currGame.previousGuesses,
    }
    state.games.pop()
    state.games.push(newGame)
    return state
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        createGame: (state: WritableDraft<UserState>, action: PayloadAction<string | undefined>) => {
            ReactGA.event('game_created')
            if (!state.games) {
                state.games = []
            }
            const answers = text;
            const prevAnswers = new Set<string>();
            state.games.forEach(g => {
                prevAnswers.add(g.answer)
            })
            let answerIndex = Math.floor(Math.random() * answers.length)
            while (prevAnswers.has(answers[answerIndex])) {
                answerIndex = Math.floor(Math.random() * answers.length)
            }

            const answer = action.payload && answerWordsSet.has(action.payload) ? action.payload : answers[answerIndex]

            state.games.push({
                answer: answer,
                currentGuess: "",
                isCurrentGuessInvalid: false,
                previousGuesses: [],
            })
        },
        makeGuess: (state: WritableDraft<UserState>) => {
            ReactGA.event('guess_made')
            const currGame = currentGame(state)
            const currGuess = currGame?.currentGuess
            if (!currGame || !currGuess) {
                return state
            }
            if (!canMakeGuess(currGame, currGuess) || currGuess.length !== 5) {
                state.games.pop()
                let alteredCurrGuess = currGuess
                if (alteredCurrGuess === 'ziggy') {
                    alteredCurrGuess = 'goose'
                } else if (alteredCurrGuess === 'goose') {
                    alteredCurrGuess = 'ziggy'
                }
                const newGame = {
                    answer: currGame.answer,
                    isCurrentGuessInvalid: true,
                    currentGuess: alteredCurrGuess,
                    previousGuesses: currGame.previousGuesses,
                }
                state.games.push(newGame)
                return state
            }

            const newGame = {
                answer: currGame.answer,
                isCurrentGuessInvalid: false,
                currentGuess: '',
                previousGuesses: currGame.previousGuesses.concat([currGuess]),
            }

            if (done(newGame)) {
                if (didWin(newGame)) {
                    ReactGA.event('game_won_general')
                    const guessCount = newGame.previousGuesses.length
                    ReactGA.event('game_won_in_' + guessCount.toString())
                } else {
                    ReactGA.event('game_lost_general')
                }   
            }

            state.games.pop()
            state.games.push(newGame)

            state.animationData.shouldAnimateLastGuess = true

            return state
        },
        addLetter: (state: WritableDraft<UserState>, action: PayloadAction<string>) => {
            return alterGuess(state, action.payload)            
        },
        removeLetter: (state: WritableDraft<UserState>) => {
            return alterGuess(state, null)
        },
        setAnimatedLastGuess: (state: WritableDraft<UserState>) => {
            state.animationData.shouldAnimateLastGuess = false
            return state
        }
    }
})

export const {
    createGame,
    makeGuess,
    addLetter,
    removeLetter,
    setAnimatedLastGuess,
} = gameSlice.actions

export default gameSlice.reducer