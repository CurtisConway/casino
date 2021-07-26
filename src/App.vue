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

            <div v-show="isPlaying" class="game-board">
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
                        :class="{'un-dealt': i + 1 > cardsDealt}" />
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

        <div class="settings" v-show="gameComplete">
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
import CasinoCard from '@/components/CasinoCard.vue';
import { GAME_STATES } from '@/constants';

export default {
    name: 'App',
    components: { CasinoCard },
    data() {
        return {
            deck: new CasinoDeck(),
            hand: new PlayerHand(),
            cardsDealt: 0,
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

        handValue() {
            let value = 0;
            if (this.hand.cards.length) {
                const aces = this.hand.cards.filter((card) => card.name === 'Ace').length;
                value = this.hand.cards.map((card) => card.value)
                    .reduce((accumulator = 0, current) => accumulator + current);
                value += (aces * 10);
            }
            return value;
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
            this.cardsDealt = 0;
            this.hand = new PlayerHand();
            this.$nextTick(() => {
                this.dealCard(this.handSize - 1);
            });
        },

        dealCard(additionalCards = 0) {
            this.hand.addCard(this.deck.cards[this.deck.cards.length - 1]);
            this.deck.cards.pop();
            clearTimeout(this.gameTimer);
            setTimeout(() => {
                this.cardsDealt += 1;
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
            if (this.submission == this.handValue) {
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
            this.completedRounds = 0;
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
            this.completedRounds = 0;
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
