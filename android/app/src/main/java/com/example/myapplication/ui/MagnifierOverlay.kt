package com.example.myapplication.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.color.ColorModel
import kotlin.math.roundToInt

@Composable
fun MagnifierOverlay(
    touchX: Float,
    touchY: Float,
    currentHex: String,
    currentLab: ColorModel.LabColor?
) {
    val density = LocalDensity.current
    val loupeDiameter = 120.dp
    val loupeRadiusPx = with(density) { (loupeDiameter / 2).toPx() }

    // Position loupe 130px above the finger; if near top edge, position 80px below
    val isNearTop = touchY < 220f
    val offsetY = if (isNearTop) 90f else -140f

    val posX = (touchX - loupeRadiusPx).roundToInt()
    val posY = (touchY + offsetY - loupeRadiusPx).roundToInt()

    val parsedColor = try {
        Color(android.graphics.Color.parseColor(currentHex))
    } catch (e: Exception) {
        Color.White
    }

    Box(
        modifier = Modifier
            .offset { IntOffset(posX, posY) }
            .size(loupeDiameter)
            .shadow(16.dp, CircleShape)
            .clip(CircleShape)
            .background(Color.DarkGray)
            .border(3.dp, Color.White, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        // Active color preview in center of loupe
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(parsedColor)
                .border(2.dp, Color.White.copy(alpha = 0.8f), CircleShape)
        )

        // Reticle crosshairs
        Box(
            modifier = Modifier
                .width(1.dp)
                .height(28.dp)
                .background(Color.White.copy(alpha = 0.85f))
        )
        Box(
            modifier = Modifier
                .height(1.dp)
                .width(28.dp)
                .background(Color.White.copy(alpha = 0.85f))
        )

        // Color badge at bottom
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 6.dp)
                .background(Color.Black.copy(alpha = 0.8f), RoundedCornerShape(8.dp))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Text(
                text = currentHex,
                color = Color.White,
                fontSize = 10.sp
            )
        }
    }
}
