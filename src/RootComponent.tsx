import { Paper, Container, Typography, Button } from '@mui/material'
import { useRef } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './root.css'
import { GameBoard } from './GameBoard'
import { addLetter, createGame, currentGame, done, makeGuess, removeLetter } from './gameReducer'
import { useAppDispatch, useAppSelector } from './hooks'

export const RootComponent: React.FC = () => {
    const userState = useAppSelector(state => state.game)
    const keyboard = useRef()

    // create game if necessary
    const dispatch = useAppDispatch()
    const currGame = currentGame(userState)
    if (!userState.games || userState.games.length === 0) {
        dispatch(createGame())
    }

    const allKeys = "abcdefghijklmnopqrstuvwxyz".split('').concat(['{bksp} {enter}'])

    const answer = currGame?.answer
    if (!answer) {
        return null
    }
    const guesses = currGame?.previousGuesses
    const perfectLetters = new Set<string>();
    const closeLetters = new Set<string>();
    const allUsedLetters = new Set<string>();
    (guesses ?? []).forEach(guess => {
        guess.split('').forEach((g, i) => {
            if (answer[i] === g) {
                perfectLetters.add(g)
            } else if (answer.includes(g)) {
                closeLetters.add(g)
            }
            allUsedLetters.add(g)
        })
    })

    const perfectLettersForKeyboard = allKeys.filter(k => perfectLetters.has(k))
    const closeLettersForKeyboard = allKeys.filter(k => !perfectLetters.has(k) && closeLetters.has(k))    
    const invalidLettersForKeyboard = allKeys.filter(k => !perfectLetters.has(k) && !closeLetters.has(k) && allUsedLetters.has(k))
    const unusedLetters = allKeys.filter(k => !allUsedLetters.has(k))

    

    return (
        <Container maxWidth="md" sx={{
            marginTop: "20px",
            marginBottom: "20px",
        }}>
            <Paper elevation={2}>
                <Typography variant="h3" sx={{
                    textAlign: "center",
                    padding: "20px",
                }}>Bobble</Typography>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <Button variant="contained"
                        disabled={!currGame || !done(currGame)}
                        onClick={() => dispatch(createGame())}
                        sx={{
                            margin: "0 auto",
                            width: "200px",
                            textAlign: "center",
                        }}>
                        New Game
                    </Button>
                </div>
                <GameBoard userState={userState} />
                <div style={{
                    position: "fixed",
                    height: "auto",
                    width: "min(90%, 852px)",
                    bottom: 0,
                }}>
                    <Keyboard
                        keyboardRef={r => (keyboard.current = r)}
                        onKeyPress={(button: string) => {
                            if (button === '{bksp}') {
                                dispatch(removeLetter())
                            } else if (button === '{enter}') {
                                dispatch(makeGuess())
                            } else {
                                dispatch(addLetter(button))
                            }
                        }}
                        theme={"hg-theme-default"}
                        layout={{
                            default: [
                                "q w e r t y u i o p",
                                "a s d f g h j k l",
                                "{enter} z x c v b n m {bksp}",
                            ],
                        }}
                        buttonTheme={[
                            {
                                class: "hg-perfect",
                                buttons: [...perfectLettersForKeyboard].join(' '),
                            },
                            {
                                class: "hg-close",
                                buttons: [...closeLettersForKeyboard].join(' '),
                            },
                            {
                                class: "hg-invalid",
                                buttons: [...invalidLettersForKeyboard].join(' '),
                            },
                            {
                                class: "hg-default",
                                buttons: [...unusedLetters].join(' ')
                            }
                        ]}
                    />
                </div>
                <div style={{ height: "250px" }} />
            </Paper>
        </Container>
    )
}