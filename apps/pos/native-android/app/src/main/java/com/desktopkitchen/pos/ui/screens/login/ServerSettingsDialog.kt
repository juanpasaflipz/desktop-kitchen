package com.desktopkitchen.pos.ui.screens.login

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.hilt.navigation.compose.hiltViewModel
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography

@Composable
fun ServerSettingsDialog(
    onDismiss: () -> Unit,
    viewModel: ServerSettingsViewModel = hiltViewModel()
) {
    var baseURL by remember { mutableStateOf(viewModel.getBaseURL()) }
    var tenantID by remember { mutableStateOf(viewModel.getTenantID()) }
    var adminSecret by remember { mutableStateOf(viewModel.getAdminSecret()) }

    val textFieldColors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = AppColors.accent,
        unfocusedBorderColor = AppColors.borderLight,
        focusedTextColor = AppColors.textPrimary,
        unfocusedTextColor = AppColors.textPrimary,
        cursorColor = AppColors.accent,
        focusedLabelColor = AppColors.accent,
        unfocusedLabelColor = AppColors.textSecondary
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Column(
            modifier = Modifier
                .width(420.dp)
                .background(AppColors.card, RoundedCornerShape(16.dp))
                .padding(24.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Text(
                "Server Settings",
                style = Typography.titleLarge,
                color = AppColors.textPrimary
            )

            Spacer(modifier = Modifier.height(20.dp))

            OutlinedTextField(
                value = baseURL,
                onValueChange = { baseURL = it },
                label = { Text("Server URL") },
                placeholder = { Text("https://yourstore.desktop.kitchen", color = AppColors.textTertiary) },
                modifier = Modifier.fillMaxWidth(),
                colors = textFieldColors,
                singleLine = true,
                shape = RoundedCornerShape(10.dp)
            )

            Text(
                text = "Use your subdomain URL (e.g. bobbys.desktop.kitchen). Tenant ID and Admin Secret are only needed for pos.desktop.kitchen.",
                style = Typography.bodySmall,
                color = AppColors.textTertiary,
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = tenantID,
                onValueChange = { tenantID = it },
                label = { Text("Tenant ID (optional)") },
                placeholder = { Text("Leave empty for subdomain URLs", color = AppColors.textTertiary) },
                modifier = Modifier.fillMaxWidth(),
                colors = textFieldColors,
                singleLine = true,
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = adminSecret,
                onValueChange = { adminSecret = it },
                label = { Text("Admin Secret (optional)") },
                modifier = Modifier.fillMaxWidth(),
                colors = textFieldColors,
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                shape = RoundedCornerShape(10.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onDismiss) {
                    Text("Cancel", color = AppColors.textSecondary)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Button(
                    onClick = {
                        viewModel.save(baseURL, tenantID, adminSecret)
                        onDismiss()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Save", color = AppColors.textPrimary)
                }
            }
        }
    }
}
