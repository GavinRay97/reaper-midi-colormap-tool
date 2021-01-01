<template>
  <div width="100%">
    <h1 style="margin-bottom: 0; padding: 0">Reaper MIDI Colormap Generator</h1>
    <h3 style="margin: none; padding: 0">by Gavin Ray (gxray)</h3>
    <ReaperLogoASCII
      style="
        width: 250px;
        margin: auto;
        border-radius: 10px;
        background-color: #66ffcc;
        font-size: 1px;
        font-family: monospace;
        font-weight: bold;
      "
    />
  </div>
  <br />

  <hr />

  <p>Soft &lt;=&gt; (Velocity) &lt;=&gt; Hard</p>
  <canvas width="157" height="130" id="midi-colormap-preview"></canvas>
  <br />
  <p><i>Top = Unselected Notes</i></p>
  <p><i>Bottom = Selected Notes</i></p>
  <h5>
    👉 Right-click the preview image and "Save as" to download colormap ".png"
    file 👈
  </h5>
  <hr style="border: 1px solid black" />

  <p>Note velocity gradient color stops (Unselected Notes) (Left-to-Right)</p>
  <button @click="addColorStopUnselectedGradient">+</button>
  <button @click="removeColorStopUnselectedGradient">-</button>
  <br />
  <br />
  <input
    type="color"
    v-for="(color, idx) in state.unselectedNote.velocityGradient.colorStops"
    v-model="state.unselectedNote.velocityGradient.colorStops[idx]"
  />
  <br />
  <br />
  <p>
    <i>
      This is the color gradient for note velocity, when notes in the piano roll
      are unselected.
    </i>
  </p>
  <hr />

  <p>Note velocity gradient color stops (Selected Notes) (Left-to-Right)</p>
  <button @click="addColorStopSelectedGradient">+</button>
  <button @click="removeColorStopSelectedGradient">-</button>
  <br />
  <br />
  <input
    type="color"
    v-for="(color, idx) in state.selectedNote.velocityGradient.colorStops"
    v-model="state.selectedNote.velocityGradient.colorStops[idx]"
  />
  <br />
  <br />
  <p>
    <i>
      This is the color gradient for note velocity, when notes in the piano roll
      are selected.
    </i>
  </p>
  <hr />

  <p>Border Color (Unselected Notes)</p>
  <input type="color" v-model="state.unselectedNote.velocityGradient.border" />
  <br />
  <br />

  <hr />

  <p>Border Color (Selected Notes)</p>
  <input type="color" v-model="state.selectedNote.velocityGradient.border" />
  <br />
  <br />
  <hr />

  <p>Pitch note colors (Unselected Notes)</p>
  <input
    type="color"
    v-for="(pitchColor, idx) in state.unselectedNote.pitchColors"
    v-model="state.unselectedNote.pitchColors[idx]"
  />
  <br />

  <p>MIDI Channel note colors (Unselected Notes)</p>
  <input
    type="color"
    v-for="(pitchColor, idx) in state.unselectedNote.midiChannelColors"
    v-model="state.unselectedNote.midiChannelColors[idx]"
  />
  <br />
  <br />

  <input
    type="checkbox"
    id="mirror-option"
    v-model="state.selectedNoteColorsMirrorUnselected"
  />
  <label for="mirror-option">
    <s>[TODO]: Mirror Unselected Note colors to Selected Notes?</s>
  </label>
  <br />

  <input
    type="checkbox"
    id="lighten-darken-option"
    v-model="state.selectedNoteLightenDarkenEnabled"
  />
  <label for="lighten-darken-option">
    Create selected note colors from modifications of unselected note colors?
  </label>
  <br />

  <div
    v-if="state.selectedNoteLightenDarkenEnabled"
    style="text-align: right; padding-right: 35%"
  >
    <br />

    <label for="lighten-percent">Lighten %</label>
    <input
      id="lighten-percent"
      type="number"
      v-model="state.selectedNoteColorModifications.lightenPercentage"
      @input="applyColorModificationsToSelectedNoteColors"
    />
    <br />

    <label for="darken-percent">Darken %</label>
    <input
      id="darken-percent"
      type="number"
      v-model="state.selectedNoteColorModifications.darkenPercentage"
      @input="applyColorModificationsToSelectedNoteColors"
    />
    <br />

    <label for="brighten-percent">Brighten %</label>
    <input
      id="brighten-percent"
      type="number"
      v-model="state.selectedNoteColorModifications.brightenPercentage"
      @input="applyColorModificationsToSelectedNoteColors"
    />
    <br />

    <label for="saturate-percent">Saturate %</label>
    <input
      id="saturate-percent"
      type="number"
      v-model="state.selectedNoteColorModifications.saturatePercentage"
      @input="applyColorModificationsToSelectedNoteColors"
    />
    <br />

    <label for="desaturate-percent">Desaturate %</label>
    <input
      id="desaturate-percent"
      type="number"
      v-model="state.selectedNoteColorModifications.desaturatePercentage"
      @input="applyColorModificationsToSelectedNoteColors"
    />
    <br />

    <label for="hueshift-degrees">Hue Shift Degrees</label>
    <input
      id="hueshift-degrees"
      type="number"
      v-model.number="state.selectedNoteColorModifications.hueshiftDegrees"
      @input="applyColorModificationsToSelectedNoteColors"
    />
    <br />
  </div>

  <div>
    <p>Pitch note colors (Selected Notes)</p>
    <input
      type="color"
      v-for="(pitchColor, idx) in state.selectedNote.pitchColors"
      v-model="state.selectedNote.pitchColors[idx]"
    />
    <br />

    <p>MIDI Channel note colors (Selected Notes)</p>
    <input
      type="color"
      v-for="(pitchColor, idx) in state.selectedNote.midiChannelColors"
      v-model="state.selectedNote.midiChannelColors[idx]"
    />
    <br />
  </div>

  <br />
  <hr />
  <br />
  <img id="colormap-guide-image" src="images/colormap_guide.png" />
</template>

<script>
import { rainbow, renderColormap } from "./utils"
import tinycolor from "tinycolor2"
import { NUM_PITCH_COLORS, NUM_MIDI_CHANNEL_COLORS } from "./constants"
import { reactive, onMounted, watchEffect } from "vue"

import ReaperLogoASCII from "./components/ReaperLogoASCII.vue"

export default {
  name: "App",
  components: {
    ReaperLogoASCII
  },
  setup() {
    // Initialize an array of 12 items, as rainbow, for default pitch colors
    const pitchColors = Array.from({ length: NUM_PITCH_COLORS }, (_, idx) =>
      rainbow(NUM_PITCH_COLORS, idx)
    )

    // Initialize an array of 19 items, as rainbow, for default MIDI channel colors
    const midiChannelColors = Array.from(
      { length: NUM_MIDI_CHANNEL_COLORS },
      (_, idx) => rainbow(NUM_MIDI_CHANNEL_COLORS, idx)
    )

    // Reactive, stateful data
    const state = reactive({
      selectedNoteColorsMirrorUnselected: false,
      selectedNoteLightenDarkenEnabled: true,
      selectedNote: {
        // Have to make clones of the pitch/midi colors else it will link them
        pitchColors: new Array(...pitchColors),
        midiChannelColors: new Array(...midiChannelColors),
        velocityGradient: {
          colorStops: ["#ffffff", "#000fff"],
          border: "#ffffff"
        }
      },
      unselectedNote: {
        // Have to make clones of the pitch/midi colors else it will link them
        pitchColors: new Array(...pitchColors),
        midiChannelColors: new Array(...midiChannelColors),
        velocityGradient: {
          colorStops: ["#ffffff", "#007fff"],
          border: "#000000"
        }
      },
      selectedNoteColorModifications: {
        lightenPercentage: 0,
        darkenPercentage: 0,
        brightenPercentage: 0,
        saturatePercentage: 0,
        desaturatePercentage: 0,
        hueshiftDegrees: 0
      }
    })

    // When component first mounted into the DOM, draw the colormap from initial state
    onMounted(() => {
      renderColormap(state)
      // Whenever state changes, re-draw the colormap.
      // This MUST go inside of onMounted, otherwise the element won't have rendered yet.
      watchEffect(() => {
        renderColormap(state)
      })
    })

    ///////////////////////////////////////////////////////

    const addColorStopUnselectedGradient = () =>
      state.unselectedNote.velocityGradient.colorStops.push("#ffffff")

    const removeColorStopUnselectedGradient = () =>
      state.unselectedNote.velocityGradient.colorStops.pop()

    const addColorStopSelectedGradient = () =>
      state.selectedNote.velocityGradient.colorStops.push("#ffffff")

    const removeColorStopSelectedGradient = () =>
      state.selectedNote.velocityGradient.colorStops.pop()

    ///////////////////////////////////////////////////////

    function applyColorModificationsToSelectedNoteColors() {
      state.selectedNote.pitchColors.forEach((_, idx) => {
        const unselectedNoteColor = state.unselectedNote.pitchColors[idx]
        const modifiedColor = tinycolor(unselectedNoteColor)
          .lighten(state.selectedNoteColorModifications.lightenPercentage)
          .darken(state.selectedNoteColorModifications.darkenPercentage)
          .brighten(state.selectedNoteColorModifications.brightenPercentage)
          .saturate(state.selectedNoteColorModifications.saturatePercentage)
          .desaturate(state.selectedNoteColorModifications.desaturatePercentage)
          .spin(state.selectedNoteColorModifications.hueshiftDegrees)
          .toHexString()
        state.selectedNote.pitchColors[idx] = modifiedColor
      })

      state.selectedNote.midiChannelColors.forEach((_, idx) => {
        const unselectedNoteColor = state.unselectedNote.midiChannelColors[idx]
        const modifiedColor = tinycolor(unselectedNoteColor)
          .lighten(state.selectedNoteColorModifications.lightenPercentage)
          .darken(state.selectedNoteColorModifications.darkenPercentage)
          .brighten(state.selectedNoteColorModifications.brightenPercentage)
          .saturate(state.selectedNoteColorModifications.saturatePercentage)
          .desaturate(state.selectedNoteColorModifications.desaturatePercentage)
          .spin(state.selectedNoteColorModifications.hueshiftDegrees)
          .toHexString()
        state.selectedNote.midiChannelColors[idx] = modifiedColor
      })
    }

    ///////////////////////////////////////////////////////

    return {
      state,
      addColorStopSelectedGradient,
      addColorStopUnselectedGradient,
      removeColorStopSelectedGradient,
      removeColorStopUnselectedGradient,
      applyColorModificationsToSelectedNoteColors
    }
  }
}
</script>

<style>
html {
  background: slategray;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: black;
  margin-top: 60px;
}
</style>
