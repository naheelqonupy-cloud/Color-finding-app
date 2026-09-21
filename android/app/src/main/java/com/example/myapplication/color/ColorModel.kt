package com.example.myapplication.color

import kotlin.math.*

object ColorModel {

    data class RgbColor(val r: Int, val g: Int, val b: Int)
    data class LabColor(val l: Float, val a: Float, val b: Float)

    // sRGB to CIELAB conversion (D65 standard illuminant)
    fun rgbToLab(rgb: RgbColor): LabColor {
        val rLin = sRgbToLinear(rgb.r)
        val gLin = sRgbToLinear(rgb.g)
        val bLin = sRgbToLinear(rgb.b)

        val x = (rLin * 0.4124564f + gLin * 0.3575761f + bLin * 0.1804375f) / 0.95047f
        val y = (rLin * 0.2126729f + gLin * 0.7151522f + bLin * 0.0721750f) / 1.00000f
        val z = (rLin * 0.0193339f + gLin * 0.1191920f + bLin * 0.9503041f) / 1.08883f

        val fx = labF(x)
        val fy = labF(y)
        val fz = labF(z)

        val l = (116f * fy - 16f).coerceIn(0f, 100f)
        val a = 500f * (fx - fy)
        val b = 200f * (fy - fz)

        return LabColor(l, a, b)
    }

    private fun sRgbToLinear(c: Int): Float {
        val v = c / 255f
        return if (v <= 0.04045f) v / 12.92f else ((v + 0.055f) / 1.055f).pow(2.4f)
    }

    private fun labF(t: Float): Float {
        val delta = 6f / 29f
        return if (t > delta * delta * delta) t.pow(1f / 3f) else t / (3f * delta * delta) + 4f / 29f
    }

    // Perceptual CIE Delta E (CIE76 / CIE94)
    fun deltaE(c1: LabColor, c2: LabColor): Float {
        val dL = c1.l - c2.l
        val da = c1.a - c2.a
        val db = c1.b - c2.b
        return sqrt(dL * dL + da * da + db * db)
    }
}
