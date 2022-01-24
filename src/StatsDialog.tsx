import { Dialog, DialogContent, DialogTitle, Divider, Grid, Typography } from "@mui/material"
import { Transition } from "./GameBoard"
import { didWin, done, UserState } from "./gameReducer"

import ReactGA from 'react-ga4'

type IProps = {
    setShowStats: ((v: boolean) => void),
    showStats: boolean,
    userState: UserState,
}

export const StatsDialog: React.FC<IProps> = (props) => {
    const doneGames = props.userState.games.filter(g => done(g))
    const winningGames = doneGames.filter(g => didWin(g))

    let currentStreak: number = 0;
    let maxStreak: number = 0;

    for (var i = 0; i < doneGames.length; i++) {
        const game = doneGames[i];
        if (didWin(game)) {
            currentStreak++
        } else {
            currentStreak = 0
        }
        maxStreak = Math.max(currentStreak, maxStreak)
    }


    const winningCountsMap = new Map<number, number>();
    [...Array(6).keys()].forEach(k => winningCountsMap.set(k + 1, 0))
    winningGames.forEach(g => {
        const guessCount = g.previousGuesses.length
        const prevCount = winningCountsMap.get(guessCount)
        winningCountsMap.set(guessCount, (prevCount ?? 0) + 1)
    })
    const maxWinningCountOccurence = Math.max(...winningCountsMap.values())

    if (props.showStats) {
        ReactGA.event('stats_shown')
    }
    console.log(winningCountsMap)

    return <>
        <Dialog
            open={props.showStats}
            onClose={() => {
                props.setShowStats(false)
            }}
            maxWidth="lg"
            TransitionComponent={Transition}
        >
            <DialogTitle sx={{
                textAlign: "center",
                fontWeight: "bold",
            }}>
                Your Stats
            </DialogTitle>
            <DialogContent>
                <div style={{
                    width: "200px",
                    marginLeft: "5px",
                    marginRight: "5px",
                }}>
                    <Grid container>
                        <Grid item xs={3}>
                            <Typography sx={{
                                textAlign: "center",
                                fontWeight: "bold",
                            }}>
                                {doneGames.length}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography sx={{
                                textAlign: "center",
                                fontWeight: "bold",
                            }}>
                                {Math.round((winningGames.length / doneGames.length) * 100)}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography sx={{
                                textAlign: "center",
                                fontWeight: "bold",
                            }}>
                                {currentStreak}
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography sx={{
                                textAlign: "center",
                                fontWeight: "bold",
                            }}>
                                {maxStreak}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid item xs={3}>
                            <Typography variant="subtitle2" sx={{
                                fontSize: "10px",
                                textAlign: "center",
                            }}>
                                Games Played
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="subtitle2" sx={{
                                fontSize: "10px",
                                textAlign: "center",
                            }}>
                                Winning Percentage
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="subtitle2" sx={{
                                fontSize: "10px",
                                textAlign: "center",
                            }}>
                                Current Streak
                            </Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="subtitle2" sx={{
                                fontSize: "10px",
                                textAlign: "center",
                            }}>
                                Best Streak
                            </Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{
                        marginTop: "15px",
                        marginBottom: "15px",
                    }} />
                    <Typography sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                    }}>
                        Winning Game Guesses
                    </Typography>
                    {[...Array(6).keys()].map(k => {
                        const winningCount = winningCountsMap.get(k+1)
                        let barWidthPercent = Math.round(((winningCount ?? 0) / maxWinningCountOccurence) * 100)
                        return <div style={{
                            height: "20px",
                        }}>
                            <Grid container sx={{
                            }}>
                                <Grid item xs={1}>
                                    <Typography sx={{
                                        display: "float",
                                        top: 0,
                                        fontSize: "15px",
                                    }}>
                                    {k + 1}
                                    </Typography>
                                </Grid>
                                <Grid item xs={11} sx={{
                                    position: "relative"
                                }}>
                                    <div style={{
                                        backgroundColor: "green",
                                        width: barWidthPercent.toString() + "%",
                                        height: "15px",
                                        position: "absolute",
                                        bottom: "3px",
                                    }}>
                                        <Typography sx={{
                                            textAlign: "right",
                                            fontSize: "10px",
                                            display: winningCount === 0 ? 'none' : undefined,
                                            marginRight: "3px",
                                        }}>
                                        {winningCount}
                                        </Typography>
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    })}
                </div>
            </DialogContent>
        </Dialog>
    </>
}