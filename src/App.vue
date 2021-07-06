<template>
    <div id="app">
        <div class="container">
            <div v-if="isWaiting || gameComplete" class="square">
                <div class="dialogue-screen">
                    <h1 v-if="!gameComplete">
                        {{ dialogText }}
                    </h1>

                    <button
                        v-if="gameComplete"
                        @click="playIntroduction">
                        Play Again
                    </button>
                </div>
            </div>

            <div v-if="isPlaying" class="game-board">
                <div class="table-instructions">
                    <svg height="100%" width="100%" viewBox="0 0 200 200">
                        <defs>
                            <path d="M15,100a85,85 0 1,0 170,0a85,85 0 1,0 -170,0" id="circle"/>
                        </defs>

                        <text dx="135" dy="-7" textLength="160" text-anchor="middle" class="ace">
                            <textPath xlink:href="#circle">
                                Ace counts as 1 or 11
                            </textPath>
                        </text>
                        <text dx="135" textLength="160" text-anchor="middle" class="total">
                            <textPath xlink:href="#circle">
                                Enter the largest hand total displayed
                            </textPath>
                        </text>
                    </svg>
                </div>

                <div v-if="extraQuestion" class="extra-question">
                    <p>
                        What was the
                        <strong>{{ randomQuestion.property }}</strong> of card
                        <strong>{{ randomQuestion.card + 1 }}</strong>?
                    </p>
                </div>
                <div class="card-stack"></div>
                <div v-show="!extraQuestion" class="hand" :class="`size-${hand.cards.length}`">
                    <CasinoCard
                        v-for="(card, i) in hand.cards"
                        :key="`card-${i}`"
                        :card="card"
                        :class="{'un-dealt': !cards[i].dealt}" />
                </div>
                <div class="input-box" v-if="allowSubmission">
                    <form @submit="checkSubmission">
                        <input ref="input" type="text" autofocus v-model="submission">
                        <button>
                            Submit
                        </button>
                    </form>
                </div>
            </div>

            <div class="timer-bar" v-if="allowSubmission && isPlaying">
                <div class="timer" :style="{'animation-duration': `${timer}s`}"></div>
            </div>
        </div>

        <div class="settings" v-if="gameComplete">
            <div class="row">
                <label for="cards">Cards (2-5)</label>
                <input id="cards" type="number" v-model.number="cardsInterface" min="2" max="5">
            </div>
            <div class="row">
                <label for="timer">Timer (1-100)</label>
                <input id="timer" type="number" v-model.number="timerInterface" min="1" max="100">
            </div>
            <div class="row">
                <label for="rounds">Rounds (1-10)</label>
                <input id="rounds" type="number" v-model.number="roundsInterface" min="1" max="10">
            </div>
        </div>
    </div>
</template>

<script>
import CasinoDeck from '@/models/CasinoDeck';
import PlayerHand from '@/models/PlayerHand';
import CasinoCard from "@/components/CasinoCard.vue";
import { GAME_STATES } from "@/constants";

export default {
    name: 'App',
    components: { CasinoCard },
    data() {
        return {
            deck: new CasinoDeck(),
            hand: new PlayerHand(),
            cards: [],
            handSize: 3,
            timer: 10,
            rounds: 3,
            completedRounds: 0,
            gameTimer: 0,
            submission: '',
            extraQuestion: false,
            randomQuestion: null,
            dialogText: 'Unauthorized casino winnings detected...',
            gameState: GAME_STATES.waiting,
            showSettings: false,
        };
    },
    computed: {
        isWaiting() {
            return this.gameState === GAME_STATES.waiting;
        },

        isPlaying() {
            return this.gameState === GAME_STATES.playing;
        },

        gameComplete() {
            return this.gameState === GAME_STATES.success || this.gameState === GAME_STATES.failure;
        },

        handValues() {
            const values = [];
            if (this.hand.cards.length) {
                values.push(this.hand.cards
                    .map((card) => card.value)
                    .reduce((accumulator = 0, currentValue) => accumulator + currentValue));
                if (this.hand.cards.filter((card) => card.name === 'Ace').length > 0) {
                    values.push(values[0] + 10);
                }
            }
            return values;
        },

        largestHandValue() {
            return (this.handValues[1] || this.handValues[0]) || 0;
        },

        allowSubmission() {
            return this.hand.cards.length === this.handSize;
        },

        cardsInterface: {
            get() {
                return this.handSize;
            },
            set(val) {
                this.handSize = Math.max(Math.min(val, 5), 2);
            },
        },

        timerInterface: {
            get() {
                return this.timer;
            },
            set(val) {
                this.timer = Math.max(Math.min(val, 100), 1);
            },
        },

        roundsInterface: {
            get() {
                return this.rounds;
            },
            set(val) {
                this.rounds = Math.max(Math.min(val, 10), 1);
            },
        },
    },
    methods: {
        dealCards() {
            this.resetInput();
            this.cards = [];
            this.hand = new PlayerHand();
            this.$nextTick(() => {
                this.dealCard(this.handSize - 1);
            });
        },

        dealCard(additionalCards = 0) {
            this.hand.addCard(this.deck.cards[this.deck.cards.length - 1]);
            this.deck.cards.pop();
            clearTimeout(this.gameTimer);

            const card = {
                dealt: false,
            };
            this.cards.push(card);
            setTimeout(() => {
                card.dealt = true;
                if (additionalCards) {
                    setTimeout(() => {
                        this.dealCard(additionalCards - 1);
                    }, 500);
                } else {
                    this.$refs.input.focus();
                    this.gameTimer = setTimeout(() => this.handleFailure(), this.timer * 1000);
                }
            }, 1);
        },

        checkSubmission(event) {
            event.preventDefault();
            event.stopPropagation();
            if (this.extraQuestion) {
                this.checkRandomSubmission();
            } else {
                this.checkValueSubmission();
            }
            this.$refs.input.focus();
        },

        checkValueSubmission() {
            // eslint-disable-next-line eqeqeq
            if (this.submission == this.largestHandValue) {
                this.extraQuestion = true;
                this.randomQuestion = this.generateRandomQuestion();
            } else {
                this.handleFailure();
            }

            this.submission = '';
        },

        checkRandomSubmission() {
            const valueToCheck = this.hand.cards[this.randomQuestion.card][this.randomQuestion.property];
            let correct = false;
            if (this.randomQuestion.property === 'value') {
                correct = this.submission == valueToCheck;
            } else {
                correct = this.submission.toLowerCase() == valueToCheck.toLowerCase();
            }

            if (correct) {
                this.completedRounds += 1;
                if (this.completedRounds >= this.rounds) {
                    this.handleSuccess();
                } else {
                    this.dealCards();
                }
            } else {
                this.handleFailure();
            }
        },

        handleFailure() {
            clearTimeout(this.gameTimer);
            this.dialogText = 'Answer incorrect...';
            this.gameState = GAME_STATES.waiting;
            this.resetInput();
            setTimeout(() => {
                this.dialogText = 'Shutting down...';
                setTimeout(() => {
                    this.gameState = GAME_STATES.failure;
                }, 2000);
            }, 2000);
        },

        handleSuccess() {
            clearTimeout(this.gameTimer);
            this.dialogText = 'Skill testing question validation complete...';
            this.gameState = GAME_STATES.waiting;
            this.resetInput();
            setTimeout(() => {
                this.dialogText = 'Shutting down...';
                setTimeout(() => {
                    this.gameState = GAME_STATES.success;
                }, 2000);
            }, 2000);
        },

        resetInput() {
            this.submission = '';
            this.extraQuestion = false;
            this.randomQuestion = null;
        },

        generateRandomQuestion() {
            const properties = ['suit', 'value', 'name'];
            return {
                property: properties[Math.floor(Math.random() * properties.length)],
                card: Math.floor(Math.random() * this.hand.cards.length),
            };
        },

        playIntroduction() {
            this.dialogText = 'Unauthorized casino winnings detected...';
            this.gameState = GAME_STATES.waiting;
            this.deck = new CasinoDeck();
            this.deck.shuffleDeck();
            setTimeout(() => {
                this.dialogText = 'Complete skill testing question for validation...';
                setTimeout(() => {
                    this.gameState = GAME_STATES.playing;
                    this.dealCards();
                }, 2000);
            }, 2000);
        },
    },
    mounted() {
        this.playIntroduction();
    },
};
</script>

<style lang="scss">
#app {
    font-family: Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

body {
    background-color: #242424;
    color:#fff;
}

.container {
    max-width: 960px;
    margin: 0 auto;
}

.square {
    position:relative;
    height:0;
    width:100%;
    padding-bottom: 60%;
}

.dialogue-screen {
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    color:#fff;
}

.table-instructions {
    position: absolute;
    height: 100%;
    width: 100%;
    top: -50%;
    left: 0;
    color: #fff;
    text-align: center;

    .ace {
        letter-spacing: 1px;
        font-size: 14px;
        font-weight: 700;
        font-family: serif;
        fill: yellow;
    }

    .total {
        letter-spacing: 1px;
        font-size: 7px;
        font-weight: 300;
        font-family: serif;
        fill: #fff;
    }
}

.game-board {
    height: 0;
    position: relative;
    padding-bottom: 60%;
    border-radius: 20px 20px 50% 50%;
    border: 10px solid #000;
    background-color: #024e00;
    background-image: url('./assets/felt.png');
}

.card-stack {
    position: absolute;
    border-radius: 5%;
    top: 20px;
    right: 20px;
    height: 37.5%;
    width: 16.4%;
    background-image: url('./assets/playing-cards-back.png');
    background-size: cover;
    box-shadow: 4px 4px 0 2px rgb(149, 149, 149);
    z-index:10;
}

.hand {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    &.size-2 {
        .card {
            &:first-child:not(:last-child) {
                transform: translateX(-35%) translateY(10%) rotate(-15deg);
                z-index: 1;
            }

            &:last-child:not(:first-child) {
                transform: translateX(35%) translateY(10%) rotate(15deg);
                z-index: 2;
            }
        }
    }

    &.size-3 {
        .card {
            &:first-child:not(:last-child) {
                transform: translateX(-65%) translateY(15%) rotate(-25deg);
                z-index: 1;
            }

            &:last-child:not(:first-child) {
                transform: translateX(65%) translateY(15%) rotate(25deg);
                z-index: 3;
            }
        }
    }

    &.size-4 {
        .card {
            &:nth-child(1) {
                transform: translateX(-75%) translateY(20%) rotate(-25deg);
                z-index: 1;
            }

            &:nth-child(2) {
                transform: translateX(-25%) translateY(5%) rotate(-15deg);
                z-index: 2;
            }

            &:nth-child(3) {
                transform: translateX(25%) translateY(5%) rotate(15deg);
                z-index: 3;
            }

            &:nth-child(4) {
                transform: translateX(75%) translateY(20%) rotate(25deg);
                z-index: 4;
            }
        }
    }

    &.size-5 {
        .card {
            &:nth-child(1) {
                transform: translateX(-105%) translateY(40%) rotate(-40deg);
                z-index: 1;
            }

            &:nth-child(2) {
                transform: translateX(-55%) translateY(15%) rotate(-25deg);
                z-index: 2;
            }

            &:nth-child(4) {
                transform: translateX(55%) translateY(15%) rotate(25deg);
                z-index: 4;
            }

            &:nth-child(5) {
                transform: translateX(105%) translateY(40%) rotate(40deg);
                z-index: 5;
            }
        }
    }

    .card {
        position: absolute;
        border-radius: 10px;
        bottom: 20%;
        left: 50%;
        height: 37.5%;
        margin-left: -8.2%;
        width: 16.4%;
        background-color: #fff;
        border: 2px solid #242424;
        z-index: 2;
        transition: transform .2s ease, opacity .2s ease;
        opacity: 1;

        &.un-dealt {
            transform: translateX(230%) translateY(-100%) !important;
            opacity: .25;
        }

        &.hearts, &.diamonds {
            color:red;
        }

        &.spades, &.clubs {
            color:black;
        }

        .card-value {
            position:absolute;
            top:0;
            left:0;
            bottom:0;
            right:0;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content: center;
            font-size:6vw;
        }

        svg {
            position:absolute;
            height:25%;
            width:25%;

            &:first-child {
                top:0;
                left:5%;
            }

            &:last-child {
                bottom:0;
                right:5%;
            }
        }
    }
}

.extra-question, .input-box {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    background-color: #242424;
    border-radius: 5px;
    padding: 10px;
    text-align: center;
    z-index: 10;
}

.settings {
    position:fixed;
    top:10px;
    right:10px;
    width:200px;
    color:#fff;

    label, input {
        font-size:16px;
        display:block;
    }

    input {
        height:50px;
        width:50px;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
            display:block;
            opacity:1;
            margin: 0;
        }
    }

    label {
        flex:1;
    }
}

.row {
    display:flex;
    flex-direction:row;
    align-items:center;
}

.extra-question {
    bottom: 30%;
    padding: 30px;

    p {
        color: #fff;
        font-size: 20px;
        font-family: Roboto, Helvetica, Arial, sans-serif;
        font-weight: 100;

        strong {
            font-weight:700;
            border-bottom:1px solid #fff;
        }
    }
}

.input-box {
    bottom: 10%;

    @media screen and (max-width: 1000px) {
        bottom: -100%;
    }
}

input, button {
    font-size: 16px;
    font-family: Roboto, Helvetica, Arial, sans-serif;
}

input {
    display: block;
    text-align: center;
    background: none;
    border: none;
    border-bottom: 1px solid #fff;
    outline: none;
    box-shadow: none;
    color: #fff;
    padding: 5px;
}

button {
    margin-top: 10px;
    background-color: #fff;
    padding: 10px 20px;
    color: #242424;
    border: none;
    font-weight:600;
    border-radius:5px;
    cursor:pointer;
}

.timer-bar {
    position:relative;
    margin-top:30px;
    height:10px;
    border-radius:10px;
    background-color:rgba(255, 255, 0, .25);

    .timer {
        position:absolute;
        top:0;
        left:0;
        bottom:0;
        right:0;
        border-radius:5px;
        background-color:rgba(255, 255, 0, 1);
        transform:scaleX(0);
        animation-name:scaleXIn;
        animation-iteration-count: 1;
        animation-timing-function: linear;
    }
}

@keyframes scaleXIn {
    from {
        transform:scaleX(1);
    }

    to {
        transform:scaleX(0);
    }
}
</style>
