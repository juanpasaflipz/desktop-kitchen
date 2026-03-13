package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.desktopkitchen.pos.models.MenuItem

@Composable
fun MenuGrid(
    items: List<MenuItem>,
    onItemClick: (MenuItem) -> Unit,
    itemIdsWithModifiers: Set<Int> = emptySet(),
    modifier: Modifier = Modifier
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(4),
        modifier = modifier,
        contentPadding = PaddingValues(4.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        items(items, key = { it.id }) { item ->
            MenuItemCard(
                item = item,
                onClick = { onItemClick(item) },
                hasModifiers = item.id in itemIdsWithModifiers
            )
        }
    }
}
