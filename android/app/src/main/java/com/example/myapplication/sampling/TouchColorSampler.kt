package com.example.myapplication.sampling

import android.graphics.Bitmap
import com.example.myapplication.color.ColorModel
import kotlin.math.exp
import kotlin.math.max
import kotlin.math.min

class TouchColorSampler(private val regionSize: Int = 25) {

    data class SampledPixel(val r: Int, val g: Int, val b: Int, val lum: Float, val weight: Float)

    /**
     * Extracts a 25x25 sampling region around (touchX, touchY).
     * Eliminates extreme specular highlights, noise, and deep shadows,
     * applying a 2D Gaussian spatial kernel and 15% trimmed mean.
     */
    fun sampleDominantColor(bitmap: Bitmap, touchX: Float, touchY: Float): Pair<ColorModel.LabColor, String> {
        val half = regionSize / 2
        val startX = max(0, (touchX - half).toInt())
        val startY = max(0, (touchY - half).toInt())
        val endX = min(bitmap.width - 1, (touchX + half).toInt())
        val endY = min(bitmap.height - 1, (touchY + half).toInt())

        val pixels = mutableListOf<SampledPixel>()
        val sigma = regionSize / 3.0f

        for (y in startY..endY) {
            for (x in startX..endX) {
                val pixel = bitmap.getPixel(x, y)
                val r = (pixel shr 16) and 0xFF
                val g = (pixel shr 8) and 0xFF
                val b = pixel and 0xFF

                val lum = 0.2126f * r + 0.7152f * g + 0.0722f * b

                // Discard specular highlights and near-zero sensor noise
                if (lum > 248f && (r > 245 || g > 245 || b > 245)) continue
                if (lum < 6f) continue

                val dx = x - touchX
                val dy = y - touchY
                val distSq = dx * dx + dy * dy
                val weight = exp(-distSq / (2 * sigma * sigma))

                pixels.add(SampledPixel(r, g, b, lum, weight))
            }
        }

        if (pixels.isEmpty()) {
            val centerPixel = bitmap.getPixel(touchX.toInt().coerceIn(0, bitmap.width - 1), touchY.toInt().coerceIn(0, bitmap.height - 1))
            val r = (centerPixel shr 16) and 0xFF
            val g = (centerPixel shr 8) and 0xFF
            val b = centerPixel and 0xFF
            val rgb = ColorModel.RgbColor(r, g, b)
            val hex = String.format("#%02X%02X%02X", r, g, b)
            return Pair(ColorModel.rgbToLab(rgb), hex)
        }

        // 15% Trimmed Mean
        pixels.sortBy { it.lum }
        val trim = (pixels.size * 0.15f).toInt()
        val trimmed = pixels.subList(trim, pixels.size - trim)

        var sumR = 0f
        var sumG = 0f
        var sumB = 0f
        var totalW = 0f

        for (p in trimmed) {
            sumR += p.r * p.weight
            sumG += p.g * p.weight
            sumB += p.b * p.weight
            totalW += p.weight
        }

        val avgR = (sumR / totalW).toInt().coerceIn(0, 255)
        val avgG = (sumG / totalW).toInt().coerceIn(0, 255)
        val avgB = (sumB / totalW).toInt().coerceIn(0, 255)

        val rgb = ColorModel.RgbColor(avgR, avgG, avgB)
        val hex = String.format("#%02X%02X%02X", avgR, avgG, avgB)
        return Pair(ColorModel.rgbToLab(rgb), hex)
    }
}
