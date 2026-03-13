package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.desktopkitchen.pos.models.MenuItem
import com.desktopkitchen.pos.models.ModifierGroup
import com.desktopkitchen.pos.models.ModifierItem
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter

@Composable
fun ModifierSelectionDialog(
    menuItem: MenuItem,
    groups: List<ModifierGroup>,
    quantity: Int,
    onQuantityChange: (Int) -> Unit,
    onConfirm: (selectedModifiers: List<ModifierItem>, quantity: Int, notes: String?) -> Unit,
    onDismiss: () -> Unit
) {
    // Special instructions
    var notes by remember { mutableStateOf("") }

    // Track selected modifier IDs per group
    val selections = remember { mutableStateMapOf<Int, MutableSet<Int>>() }

    // Initialize empty sets for each group
    groups.forEach { group ->
        if (!selections.containsKey(group.id)) {
            selections[group.id] = mutableSetOf()
        }
    }

    val allSelected = groups.flatMap { group ->
        val groupMods = group.modifiers ?: emptyList()
        val selectedIds = selections[group.id] ?: emptySet()
        groupMods.filter { it.id in selectedIds }
    }

    val modifierTotal = allSelected.sumOf { it.price_adjustment }
    val lineTotal = (menuItem.price + modifierTotal) * quantity

    // Validation: check required groups
    val isValid = groups.all { group ->
        if (!group.required) true
        else {
            val count = selections[group.id]?.size ?: 0
            count >= (if (group.min_selections > 0) group.min_selections else 1)
        }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth(0.5f)
                .clip(RoundedCornerShape(16.dp))
                .background(AppColors.card)
                .padding(20.dp)
        ) {
            // Header
            Text(
                text = menuItem.name,
                style = Typography.headlineMedium,
                color = AppColors.textPrimary
            )
            Text(
                text = CurrencyFormatter.format(menuItem.price),
                style = Typography.bodyLarge,
                color = AppColors.accent
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Modifier groups
            LazyColumn(
                modifier = Modifier.weight(1f, fill = false),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(groups) { group ->
                    ModifierGroupSection(
                        group = group,
                        selectedIds = selections[group.id] ?: emptySet(),
                        onToggle = { modifierId ->
                            val current = selections.getOrPut(group.id) { mutableSetOf() }
                            if (group.selection_type == "single") {
                                // Radio behavior
                                val newSet = mutableSetOf<Int>()
                                if (modifierId !in current) newSet.add(modifierId)
                                selections[group.id] = newSet
                            } else {
                                // Checkbox behavior with max_selections
                                val newSet = current.toMutableSet()
                                if (modifierId in newSet) {
                                    newSet.remove(modifierId)
                                } else if (group.max_selections <= 0 || newSet.size < group.max_selections) {
                                    newSet.add(modifierId)
                                }
                                selections[group.id] = newSet
                            }
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Special Instructions
            Text(
                text = "Special Instructions",
                style = Typography.titleMedium,
                color = AppColors.textPrimary
            )
            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                placeholder = { Text("e.g., No onions, extra sauce...", color = AppColors.textTertiary) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = AppColors.textPrimary,
                    unfocusedTextColor = AppColors.textPrimary,
                    focusedBorderColor = AppColors.accent,
                    unfocusedBorderColor = AppColors.border,
                    cursorColor = AppColors.accent,
                    focusedContainerColor = AppColors.surface,
                    unfocusedContainerColor = AppColors.surface
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = AppColors.border)
            Spacer(modifier = Modifier.height(12.dp))

            // Quantity selector
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { if (quantity > 1) onQuantityChange(quantity - 1) },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(AppColors.surface)
                ) {
                    Icon(Icons.Default.Remove, "Decrease", tint = AppColors.textPrimary)
                }
                Text(
                    text = "$quantity",
                    style = Typography.titleLarge,
                    color = AppColors.textPrimary,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )
                IconButton(
                    onClick = { onQuantityChange(quantity + 1) },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(AppColors.surface)
                ) {
                    Icon(Icons.Default.Add, "Increase", tint = AppColors.textPrimary)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Footer buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TextButton(
                    onClick = onDismiss,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Cancel", color = AppColors.textSecondary)
                }
                Button(
                    onClick = { onConfirm(allSelected, quantity, notes.ifBlank { null }) },
                    enabled = isValid,
                    modifier = Modifier.weight(2f),
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        "Add ${CurrencyFormatter.format(lineTotal)}",
                        style = Typography.titleMedium,
                        color = AppColors.textPrimary
                    )
                }
            }
        }
    }
}

@Composable
private fun ModifierGroupSection(
    group: ModifierGroup,
    selectedIds: Set<Int>,
    onToggle: (Int) -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = group.name,
                style = Typography.titleMedium,
                color = AppColors.textPrimary
            )
            if (group.required) {
                Text(
                    text = "Required",
                    style = Typography.bodySmall,
                    color = AppColors.warning
                )
            }
        }

        val hint = when {
            group.selection_type == "single" -> "Choose one"
            group.max_selections > 0 -> "Choose up to ${group.max_selections}"
            else -> "Choose any"
        }
        Text(text = hint, style = Typography.bodySmall, color = AppColors.textTertiary)

        Spacer(modifier = Modifier.height(8.dp))

        group.modifiers?.filter { it.active }?.forEach { mod ->
            val isSelected = mod.id in selectedIds
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .then(
                        if (isSelected) Modifier.border(1.dp, AppColors.accent, RoundedCornerShape(8.dp))
                        else Modifier.border(1.dp, AppColors.border, RoundedCornerShape(8.dp))
                    )
                    .background(if (isSelected) AppColors.accentDark.copy(alpha = 0.15f) else AppColors.surface)
                    .clickable { onToggle(mod.id) }
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    if (isSelected) {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = null,
                            tint = AppColors.accent,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    Text(
                        text = mod.name,
                        style = Typography.bodyMedium,
                        color = if (isSelected) AppColors.textPrimary else AppColors.textSecondary
                    )
                }
                if (mod.price_adjustment != 0.0) {
                    Text(
                        text = "+${CurrencyFormatter.format(mod.price_adjustment)}",
                        style = Typography.bodyMedium,
                        color = AppColors.accent
                    )
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
        }
    }
}
