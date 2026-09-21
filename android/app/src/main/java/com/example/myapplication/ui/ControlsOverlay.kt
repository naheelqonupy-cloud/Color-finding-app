package com.example.myapplication.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.CameraMode

@Composable
fun ControlsOverlay(
    cameraMode: CameraMode,
    isLocked: Boolean,
    selectedHex: String,
    specificity: Float,
    saturation: Float,
    onToggleLock: () -> Unit,
    onToggleMode: () -> Unit,
    onSpecificityChange: (Float) -> Unit,
    onSaturationChange: (Float) -> Unit,
    onCapturePhoto: () -> Unit
) {
    val swatchColor = try {
        Color(android.graphics.Color.parseColor(selectedHex))
    } catch (e: Exception) {
        Color.White
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Top Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Selected color pill
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.Black.copy(alpha = 0.65f))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(swatchColor)
                        .border(1.dp, Color.White, CircleShape)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = selectedHex,
                    color = Color.White,
                    fontSize = 13.sp
                )
            }

            // Lock button
            IconButton(
                onClick = onToggleLock,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(if (isLocked) Color(0xFFE11D48) else Color.Black.copy(alpha = 0.6f))
            ) {
                Text(
                    text = if (isLocked) "LOCKED" else "LOCK",
                    color = Color.White,
                    fontSize = 10.sp
                )
            }
        }

        // Bottom Controls HUD
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .navigationBarsPadding()
                .background(Color.Black.copy(alpha = 0.75f))
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Mode switch toggle
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.DarkGray.copy(alpha = 0.6f))
                    .padding(4.dp)
            ) {
                val normalSelected = cameraMode == CameraMode.NORMAL
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (normalSelected) Color.White else Color.Transparent)
                        .clickable { if (!normalSelected) onToggleMode() }
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "NORMAL",
                        color = if (normalSelected) Color.Black else Color.Gray,
                        fontSize = 12.sp
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (!normalSelected) Color(0xFF10B981) else Color.Transparent)
                        .clickable { if (normalSelected) onToggleMode() }
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "FIND COLOR",
                        color = if (!normalSelected) Color.White else Color.Gray,
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Specificity slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "SPECIFICITY",
                    color = Color.LightGray,
                    fontSize = 10.sp,
                    modifier = Modifier.width(80.dp)
                )
                Slider(
                    value = specificity,
                    onValueChange = onSpecificityChange,
                    valueRange = 1f..100f,
                    modifier = Modifier.weight(1f)
                )
            }

            // Saturation slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "SATURATION",
                    color = Color.LightGray,
                    fontSize = 10.sp,
                    modifier = Modifier.width(80.dp)
                )
                Slider(
                    value = saturation,
                    onValueChange = onSaturationChange,
                    valueRange = 0.5f..2.5f,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Shutter capture button
            Box(
                modifier = Modifier
                    .size(68.dp)
                    .clip(CircleShape)
                    .border(4.dp, Color.White, CircleShape)
                    .padding(5.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .clickable { onCapturePhoto() }
            )
        }
    }
}
