import {
  NOTE_WIDTH,
  NOTE_HEIGHT,
  BORDER_HEIGHT,
  NUM_PITCH_COLORS,
  NUM_MIDI_CHANNEL_COLORS,
  VELOCITY_GRADIENT_WIDTH,
  MIDI_COLORMAP_HEIGHT,
  MIDI_COLORMAP_WIDTH
} from "./constants"

export function setCanvasHeightAndWidth(ctx) {
  ctx.canvas.height = MIDI_COLORMAP_HEIGHT
  ctx.canvas.width = MIDI_COLORMAP_WIDTH
}

//////////////////////
// UNSELECTED NOTE
//////////////////////

function drawUnselectedNotePitch({ noteNumber, ctx, color }) {
  // Draw a rectangle 64 pixels high that is horizontally offset by the current note number
  // IE, note 0 will start at (0,0) and note 5 at (5,0), since each note takes 1px width
  ctx.fillStyle = color
  ctx.fillRect(noteNumber, 0, NOTE_WIDTH, NOTE_HEIGHT)
}

function drawUnselectedNoteMIDIChannel({ noteNumber, ctx, color }) {
  ctx.fillStyle = color
  ctx.fillRect(
    NUM_PITCH_COLORS + VELOCITY_GRADIENT_WIDTH + noteNumber,
    0,
    NOTE_WIDTH,
    NOTE_HEIGHT
  )
}

function drawUnselectedNoteVelocityGradient({ ctx, colorStops, borderColor }) {
  const gradient = ctx.createLinearGradient(
    NUM_PITCH_COLORS,
    0,
    VELOCITY_GRADIENT_WIDTH + NUM_PITCH_COLORS,
    0
  )

  colorStops.forEach((stop, idx) => {
    const offset = 1.0 / (idx + 1)
    gradient.addColorStop(1 - offset, stop)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(NUM_PITCH_COLORS, 0, VELOCITY_GRADIENT_WIDTH, NOTE_HEIGHT)
  // Draw 1px high border directly underneath, across the width of the entire image
  ctx.fillStyle = borderColor
  ctx.fillRect(0, NOTE_HEIGHT, MIDI_COLORMAP_WIDTH, BORDER_HEIGHT)
}

//////////////////////
// SELECTED NOTE
//////////////////////

function drawSelectedNotePitch({ noteNumber, ctx, color }) {
  // Draw a rectangle 64 pixels high that is horizontally offset by the current note number
  // IE, note 0 will start at (0,0) and note 5 at (5,0), since each note takes 1px width
  ctx.fillStyle = color
  ctx.fillRect(noteNumber, NOTE_HEIGHT + BORDER_HEIGHT, NOTE_WIDTH, NOTE_HEIGHT)
}

function drawSelectedNoteMIDIChannel({ noteNumber, ctx, color }) {
  ctx.fillStyle = color
  ctx.fillRect(
    NUM_PITCH_COLORS + VELOCITY_GRADIENT_WIDTH + noteNumber,
    NOTE_HEIGHT + BORDER_HEIGHT,
    NOTE_WIDTH,
    NOTE_HEIGHT
  )
}

function drawSelectedNoteVelocityGradient({ ctx, colorStops, borderColor }) {
  const gradient = ctx.createLinearGradient(
    NUM_PITCH_COLORS,
    NOTE_HEIGHT + BORDER_HEIGHT,
    VELOCITY_GRADIENT_WIDTH + NUM_PITCH_COLORS,
    NOTE_HEIGHT + BORDER_HEIGHT
  )

  colorStops.forEach((stop, idx) => {
    const offset = 1.0 / (idx + 1)
    gradient.addColorStop(1 - offset, stop)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(
    NUM_PITCH_COLORS,
    NOTE_HEIGHT + BORDER_HEIGHT,
    VELOCITY_GRADIENT_WIDTH,
    NOTE_HEIGHT
  )
  // Draw 1px high border directly underneath, across the width of the entire image
  ctx.fillStyle = borderColor
  ctx.fillRect(
    0,
    NOTE_HEIGHT * 2 + BORDER_HEIGHT,
    MIDI_COLORMAP_WIDTH,
    BORDER_HEIGHT
  )
}

export function renderColormap(state) {
  const canvas = document.getElementById("midi-colormap-preview")
  if (!canvas) return
  if (!canvas.getContext) return

  const ctx = canvas.getContext("2d")
  if (!ctx) return

  setCanvasHeightAndWidth(ctx)

  state.unselectedNote.pitchColors.forEach((color, idx) => {
    drawUnselectedNotePitch({ ctx, color, noteNumber: idx })
  })

  drawUnselectedNoteVelocityGradient({
    ctx,
    color: state.unselectedNote.velocityGradient.color,
    colorStops: state.unselectedNote.velocityGradient.colorStops,
    borderColor: state.unselectedNote.velocityGradient.border
  })

  state.unselectedNote.midiChannelColors.forEach((color, idx) => {
    drawUnselectedNoteMIDIChannel({ ctx, color, noteNumber: idx })
  })

  // SELECTED NOTE
  state.selectedNote.pitchColors.forEach((color, idx) => {
    drawSelectedNotePitch({ ctx, color, noteNumber: idx })
  })

  drawSelectedNoteVelocityGradient({
    ctx,
    color: state.selectedNote.velocityGradient.color,
    colorStops: state.selectedNote.velocityGradient.colorStops,
    borderColor: state.selectedNote.velocityGradient.border
  })

  state.selectedNote.midiChannelColors.forEach((color, idx) => {
    drawSelectedNoteMIDIChannel({ ctx, color, noteNumber: idx })
  })
}

export function rainbow(numOfSteps, step) {
  // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
  // Adam Cole, 2011-Sept-14
  // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  var r, g, b
  var h = step / numOfSteps
  var i = ~~(h * 6)
  var f = h * 6 - i
  var q = 1 - f
  switch (i % 6) {
    case 0:
      r = 1
      g = f
      b = 0
      break
    case 1:
      r = q
      g = 1
      b = 0
      break
    case 2:
      r = 0
      g = 1
      b = f
      break
    case 3:
      r = 0
      g = q
      b = 1
      break
    case 4:
      r = f
      g = 0
      b = 1
      break
    case 5:
      r = 1
      g = 0
      b = q
      break
  }
  var c =
    "#" +
    ("00" + (~~(r * 255)).toString(16)).slice(-2) +
    ("00" + (~~(g * 255)).toString(16)).slice(-2) +
    ("00" + (~~(b * 255)).toString(16)).slice(-2)
  return c
}
