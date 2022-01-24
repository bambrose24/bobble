import { Grid, Paper, Typography, useTheme } from "@mui/material"
import React, { useEffect, useState } from "react"
import { UserState, makeGuess, currentGame, addLetter, removeLetter, setAnimatedLastGuess, done, didWin } from "./gameReducer"
import { useAppDispatch } from "./hooks"

type IProps = {
    userState: UserState,
}

export const GameBoard: React.FC<IProps> = (props) => {
    const theme = useTheme()
    const userState = props.userState
    const currGame = currentGame(userState)
    const currGuessIndex = currGame?.previousGuesses.length ?? 0
    const prevGuessIndex = currGuessIndex - 1
    const currGuess = currGame?.currentGuess
    const dispatch = useAppDispatch()

    const [minIndexToColor, setMinIndexToColor] = useState<number>(0)

    useEffect(() => {
        if (userState.animationData.shouldAnimateLastGuess) {
            const interval = setInterval(() => {
                setMinIndexToColor(x => {
                    if (x > 6) {
                        dispatch(setAnimatedLastGuess())
                        clearInterval(interval)
                        return 0
                    }
                    return x + 1
                })
            }, 400)
        }
    }, [userState.animationData.shouldAnimateLastGuess, dispatch])

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
            const remainingLetters = new Set<string>();
            for (let i = 0; i < 5; i++) {
                if (solvedIndexes.has(i)) {
                    continue
                }
                remainingLetters.add(answer[i] as string)
            }

            [...Array(5).keys()].forEach(letterKey => {
                if (solvedIndexes.has(letterKey)) {
                    return
                }
                const guessedLetter = guess[letterKey]
                if (!guessedLetter) {
                    return
                }
                const mapKey = guessKey + "," + letterKey
                if (remainingLetters.has(guessedLetter)) {
                    backgroundColorsMap.set(mapKey, theme.palette.warning.main)
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

    const showAnswer = currGame && done(currGame) && !didWin(currGame)

    return <>
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <Paper
                elevation={3}
                sx={{
                    backgroundColor: theme.palette.grey[200],
                    margin: "20px",
                    height: "calc(min(12vw, 100px) * 0.8)",
                    opacity: showAnswer ? undefined : 0,
                }}
            >
                <Typography variant="h5" sx={{
                    fontSize: "calc(min(12vw, 100px) * 0.5)",
                    padding: "5px",
                    textAlign: "center",
                    color: theme.palette.getContrastText(theme.palette.grey[200])
                }}>
                    {showAnswer ? currGame.answer.toLocaleUpperCase() : ''}
                </Typography>
            </Paper>
        </div>
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
                            marginTop: "10px",
                            marginBottom: "10px",
                            display: "flex",
                            justifyContent: "center",
                        }}>
                            <Paper elevation={8} sx={{
                                width: "min(11vw, 100px)",
                                height: "min(11vw, 100px)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: isCurrentGuess && currGame.isCurrentGuessInvalid ? theme.palette.error.main : canShowBackgroundColor ? backgroundColorsMap.get(backgroundColorMapKey) : undefined,
                            }}>
                                <Typography variant="h3" sx={{
                                    fontSize: "calc(min(11vw, 100px) * 0.7)",
                                    flex: "0 0",
                                    padding: "10px",
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