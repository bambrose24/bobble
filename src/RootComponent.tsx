import { Paper, Container, Typography, Button, AppBar, Toolbar, Grid } from '@mui/material'
import { useRef, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './root.css'
import { GameBoard } from './GameBoard'
import { addLetter, createGame, currentGame, done, makeGuess, removeLetter } from './gameReducer'
import { useAppDispatch, useAppSelector } from './hooks'
import { StatsDialog } from './StatsDialog';

export const RootComponent: React.FC = () => {
    const userState = useAppSelector(state => state.game)
    const keyboard = useRef()

    // create game if necessary
    const dispatch = useAppDispatch()
    const currGame = currentGame(userState)
    if (!userState.games || userState.games.length === 0) {
        dispatch(createGame())
    }

    const [showStats, setShowStats] = useState<boolean>(false)

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
        <Container maxWidth="sm" sx={{
            marginTop: "20px",
            marginBottom: "20px",
        }}>
            <AppBar position="static">
                <Toolbar>
                    <Grid container>
                        <Grid item xs={3}>
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => setShowStats(true)}
                                color="inherit"
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                }}
                            >Stats</Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="h4" component="div" sx={{
                                flexGrow: 1,
                                textAlign: "center",
                                fontWeight: "bold",
                            }}>
                                Bobble
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                variant="outlined"
                                size="large"
                                color="inherit"
                                onClick={() => dispatch(createGame())}
                                disabled={!currGame || !done(currGame)}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                New
                            </Button>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <StatsDialog setShowStats={setShowStats} showStats={showStats} userState={userState} />
            <Paper elevation={2}>
                <GameBoard userState={userState} />
                <div style={{
                    height: "auto",
                    marginTop: "10px",
                    width: "min(100%, 907px)",
                    marginBottom: "15px",
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
                        display={{
                            '{bksp}': '⌫',
                            '{enter}': 'enter',
                        }}
                        buttonTheme={[
                            {
                                class: "hg-all hg-perfect",
                                buttons: [...perfectLettersForKeyboard].join(' '),
                            },
                            {
                                class: "hg-all hg-close",
                                buttons: [...closeLettersForKeyboard].join(' '),
                            },
                            {
                                class: "hg-all hg-invalid",
                                buttons: [...invalidLettersForKeyboard].join(' '),
                            },
                            {
                                class: "hg-all hg-default",
                                buttons: [...unusedLetters].filter(l => l !== '{bksp}').join(' ')
                            },
                            {
                                class: "hg-all hg-backspace",
                                buttons: '{bksp}',
                            }
                        ]}
                    />
                </div>
            </Paper>
        </Container>
    )
}