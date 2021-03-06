import { Button, Dialog, DialogContent, DialogContentText, DialogTitle, Grid, Paper, Slide, Typography, useTheme } from "@mui/material"
import { TransitionProps } from '@mui/material/transitions'
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { UserState, makeGuess, currentGame, addLetter, removeLetter, setAnimatedLastGuess, done, didWin, createGame } from "./gameReducer"
import { useAppDispatch } from "./hooks"
import { IRouterParams } from "./RootComponent"

type IProps = {
    userState: UserState,
}

export const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const GameBoard: React.FC<IProps> = (props) => {
    const theme = useTheme()
    const params = useParams<IRouterParams>()
    const userState = props.userState
    const currGame = currentGame(userState)
    const currGuessIndex = currGame?.previousGuesses.length ?? 0
    const prevGuessIndex = currGuessIndex - 1
    const currGuess = currGame?.currentGuess
    const dispatch = useAppDispatch()
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [seenModal, setSeenModal] = useState<boolean>(false)

    const [minIndexToColor, setMinIndexToColor] = useState<number>(0)

    useEffect(() => {
        if (userState.animationData.shouldAnimateLastGuess) {
            const interval = setInterval(() => {
                setMinIndexToColor(x => {
                    if (x > 4) {
                        dispatch(setAnimatedLastGuess())
                        clearInterval(interval)
                        return 0
                    }
                    return x + 1
                })
            }, 400)
        }
    }, [userState.animationData.shouldAnimateLastGuess, dispatch])

    useEffect(() => setSeenModal(false), [currGame])

    const answer = currGame?.answer

    const backgroundColorsMap = new Map<string, string>();
    if (answer) {
        [...Array(6).keys()].forEach(guessKey => {
            const prevGuesses = currGame.previousGuesses
            const guess = guessKey < prevGuesses.length ? prevGuesses[guessKey] : null
            if (!guess) {
                return
            }
            const solvedIndexes = new Set<number>();
            [...Array(5).keys()].forEach(letterKey => {
                const correctLetter = answer[letterKey]
                const guessedLetter = guess[letterKey]
                if (!guessedLetter) {
                    return
                }
                const mapKey = guessKey + "," + letterKey

                if (correctLetter === guessedLetter) {
                    solvedIndexes.add(letterKey)
                    backgroundColorsMap.set(mapKey, theme.palette.success.dark)
                }
            });
            const remainingLetters = new Map<string, number>();
            for (let i = 0; i < 5; i++) {
                if (solvedIndexes.has(i)) {
                    continue
                }
                const c = answer[i]
                if (!remainingLetters.has(c)) {
                    remainingLetters.set(c, 0)
                }
                const letterCount = remainingLetters.get(c) as number
                remainingLetters.set(c, letterCount + 1)
            }

            [...Array(5).keys()].forEach(letterKey => {
                if (solvedIndexes.has(letterKey)) {
                    return
                }
                const guessedLetter = guess[letterKey]
                const mapKey = guessKey + "," + letterKey
                if (remainingLetters.has(guessedLetter)) {
                    backgroundColorsMap.set(mapKey, theme.palette.warning.main)
                    const remaining = (remainingLetters.get(guessedLetter) ?? 0) - 1
                    if (remaining <= 0) {
                        remainingLetters.delete(guessedLetter)
                    } else {
                        remainingLetters.set(guessedLetter, remaining)
                    }
                } else {
                    backgroundColorsMap.set(mapKey, theme.palette.grey[600])
                }
            })
        })
    }

    useEffect(() => {
        window.addEventListener('keydown', (e) => {
            if (e.key.match(/^[A-Za-z]{1}$/g)) {
                dispatch(addLetter(e.key))
            } else if (e.key === 'Backspace') {
                dispatch(removeLetter())
            } else if (e.key === 'Enter') {
                dispatch(makeGuess())
            }
        })
    }, [dispatch])

    if (!currGame) {
        return null
    }

    const gameDone = done(currGame)
    if (gameDone && !modalOpen) {
        setModalOpen(true)
    }

    const won = done(currGame) && didWin(currGame)
    console.log('haha you cheated and found the answer...', answer)
    return <>
        <Dialog
            open={gameDone && modalOpen && !seenModal && !userState.animationData.shouldAnimateLastGuess}
            onClose={() => {
                setSeenModal(true)
                setModalOpen(false)
            }}
            TransitionComponent={Transition}
        >
            <DialogTitle>
                {won ? "You won!" : "Oh no :("}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                    {won ?
                        <div>You correctly guessed <b>{currGame.answer.toLocaleUpperCase()}</b> in <b>{currGame.previousGuesses.length}</b> attempts</div>
                        :
                        <div>The answer was <b>{currGame.answer.toLocaleUpperCase()}</b>. Try again!</div>
                    }
                </DialogContentText>
                <Button
                    size="large"
                    variant="outlined"
                    color="inherit"
                    onClick={() => {
                        setModalOpen(false)
                        setSeenModal(true)
                        new Promise((resolve) => setTimeout(resolve, 300)).then(() => dispatch(createGame(params.alwaysWord)))
                    }}
                    sx={{
                        marginTop: "10px",
                        width: "100%",
                    }}>New Game</Button>
            </DialogContent>
        </Dialog>
        {[...Array(6).keys()].map(guessKey => {
            const isCurrentGuess = currGuessIndex === guessKey
            const guess = isCurrentGuess ? currGuess : guessKey < currGame.previousGuesses.length ? currGame.previousGuesses[guessKey] : null
            return <Grid container key={`row_container_${guessKey}`}>
                <Grid item key={`row1_${guessKey}`} xs={1} />
                {[...Array(5).keys()].map(guessLetterKey => {
                    const backgroundColorMapKey = guessKey + "," + guessLetterKey
                    const shouldAnimate = userState.animationData.shouldAnimateLastGuess
                    const canShowBackgroundColor = (guessKey === prevGuessIndex && shouldAnimate && minIndexToColor >= guessLetterKey) || (shouldAnimate && guessKey < prevGuessIndex) || (!shouldAnimate && guess)
                    return <>
                        <Grid item key={`row_col_${guessKey}_${guessLetterKey}`} xs={2} sx={{
                            marginTop: "6px",
                            display: "flex",
                            justifyContent: "center",
                        }}>
                            <Paper elevation={8} sx={{
                                width: "min(14vw, 85px)",
                                height: "min(14vw, 85px)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: isCurrentGuess && currGame.isCurrentGuessInvalid ? theme.palette.error.main : canShowBackgroundColor ? backgroundColorsMap.get(backgroundColorMapKey) : undefined,
                            }}>
                                <Typography variant="h3" sx={{
                                    fontSize: "calc(min(14vw, 85px) * 0.6)",
                                    flex: "0 0",
                                    padding: "10px",
                                    fontWeight: "bold",
                                }}>
                                    {guess ? guess[guessLetterKey]?.toLocaleUpperCase() : undefined}
                                </Typography>
                            </Paper>
                        </Grid>
                    </>
                })}
                <Grid item key={`row2_${guessKey}`} xs={1} />
            </Grid>
        })}
    </>
}