package com.example.myapplication.processing

import android.graphics.Bitmap
import com.example.myapplication.color.ColorModel
import kotlin.math.pow

class FindModeProcessor {

    /**
     * Converts non-matching pixels to grayscale while preserving matching colors.
     * Incorporates 3x3 spatial coherence filtering to avoid noisy colored speckles.
     */
    fun processFrame(
        input: Bitmap,
        targetLab: ColorModel.LabColor?,
        specificity: Float,
        saturation: Float
    ): Bitmap {
        if (targetLab == null) return input

        // Specificity maps 1..100 to Delta E threshold 42..5.5
        val t = ((specificity - 1f) / 99f).coerceIn(0f, 1f)
        val threshold = 42f - 36.5f * t.pow(0.75f)

        val width = input.width
        val height = input.height
        val output = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)

        val pixels = IntArray(width * height)
        input.getPixels(pixels, 0, width, 0, 0, width, height)

        val matchMask = BooleanArray(width * height)

        // Pass 1: CIELAB Delta E classification
        for (i in pixels.indices) {
            val pixel = pixels[i]
            val r = (pixel shr 16) and 0xFF
            val g = (pixel shr 8) and 0xFF
            val b = pixel and 0xFF

            val lab = ColorModel.rgbToLab(ColorModel.RgbColor(r, g, b))
            val dist = ColorModel.deltaE(lab, targetLab)
            matchMask[i] = dist <= threshold
        }

        // Pass 2: 3x3 Spatial Coherence & Color Filtering
        for (y in 0 until height) {
            for (x in 0 until width) {
                val idx = y * width + x
                val pixel = pixels[idx]
                val r = (pixel shr 16) and 0xFF
                val g = (pixel shr 8) and 0xFF
                val b = pixel and 0xFF

                val lum = (0.2126f * r + 0.7152f * g + 0.0722f * b).toInt()

                // Check 3x3 neighborhood consistency
                var neighborMatches = 0
                for (dy in -1..1) {
                    for (dx in -1..1) {
                        if (dx == 0 && dy == 0) continue
                        val nx = (x + dx).coerceIn(0, width - 1)
                        val ny = (y + dy).coerceIn(0, height - 1)
                        if (matchMask[ny * width + nx]) neighborMatches++
                    }
                }

                // Spatial smoothing rule: eliminate isolated noise speckles
                val isSolidMatch = if (matchMask[idx]) {
                    neighborMatches >= 2 // Reject isolated single pixel
                } else {
                    neighborMatches >= 6 // Fill small pinholes
                }

                if (isSolidMatch) {
                    // Retain color + apply saturation adjustment
                    val satR = (lum + (r - lum) * saturation).toInt().coerceIn(0, 255)
                    val satG = (lum + (g - lum) * saturation).toInt().coerceIn(0, 255)
                    val satB = (lum + (b - lum) * saturation).toInt().coerceIn(0, 255)
                    pixels[idx] = (0xFF shl 24) or (satR shl 16) or (satG shl 8) or satB
                } else {
                    // Non-matching pixel becomes grayscale
                    pixels[idx] = (0xFF shl 24) or (lum shl 16) or (lum shl 8) or lum
                }
            }
        }

        output.setPixels(pixels, 0, width, 0, 0, width, height)
        return output
    }
}
