import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/types/types-external'
import { text } from './words'

const words = new Set(text.split("\n"))

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
    return !game.previousGuesses.includes(guess) && words.has(guess)
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
    games: [{
        answer: text.split("\n")[Math.floor(Math.random() * words.size)],
        currentGuess: '',
        isCurrentGuessInvalid: false,
        previousGuesses: []
    }],
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
        createGame: (state: WritableDraft<UserState>) => {
            if (!state.games) {
                state.games = []
            }
            const answers = text.split("\n")
            const answerIndex = Math.floor(Math.random() * answers.length)

            state.games.push({
                answer: answers[answerIndex],
                currentGuess: "",
                isCurrentGuessInvalid: false,
                previousGuesses: [],
            })
        },
        makeGuess: (state: WritableDraft<UserState>) => {
            const currGame = currentGame(state)
            const currGuess = currGame?.currentGuess
            if (!currGame || !currGuess) {
                return state
            }
            if (!canMakeGuess(currGame, currGuess) || currGuess.length !== 5) {
                state.games.pop()
                const newGame = {
                    answer: currGame.answer,
                    isCurrentGuessInvalid: true,
                    currentGuess: currGuess,
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