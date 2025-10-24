# React Native Vector Icons Migration Guide

## Changes Made

The `react-native-vector-icons` package has been deprecated in favor of per-icon-family packages. We've migrated to the new model.

## Old Package (Deprecated)
```json
"react-native-vector-icons": "^10.3.0"
```

## New Packages (Per-Icon-Family)
```json
"@react-native-vector-icons/material-community-icons": "^10.3.0",
"@react-native-vector-icons/material-icons": "^10.3.0",
"@react-native-vector-icons/font-awesome": "^10.3.0",
"@react-native-vector-icons/ionicons": "^10.3.0"
```

## Migration Steps

### Before (Old Import)
```typescript
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
```

### After (New Import)
```typescript
import Icon from '@react-native-vector-icons/material-community-icons';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import FontAwesome from '@react-native-vector-icons/font-awesome';
import Ionicons from '@react-native-vector-icons/ionicons';
```

## Usage (No Change)
```typescript
<Icon name="check-circle" size={24} color="#4CAF50" />
<MaterialIcon name="home" size={24} color="#2196F3" />
<FontAwesome name="star" size={24} color="#FFC107" />
<Ionicons name="settings" size={24} color="#9E9E9E" />
```

## iOS Setup
If using CocoaPods, no additional setup needed. The fonts are automatically linked.

## Android Setup
No additional setup needed. The fonts are automatically linked with autolinking.

## Available Icon Families
- `@react-native-vector-icons/material-community-icons` - Material Design Community Icons (6000+ icons)
- `@react-native-vector-icons/material-icons` - Material Design Icons
- `@react-native-vector-icons/font-awesome` - FontAwesome icons
- `@react-native-vector-icons/ionicons` - Ionicons
- `@react-native-vector-icons/feather` - Feather icons
- `@react-native-vector-icons/antdesign` - Ant Design icons

## Search for Icons
1. Material Community Icons: https://pictogrammers.com/library/mdi/
2. Material Icons: https://fonts.google.com/icons
3. FontAwesome: https://fontawesome.com/icons
4. Ionicons: https://ionic.io/ionicons

## Notes
- Only install the icon families you actually use to reduce bundle size
- Each icon family is a separate package now
- Importing specific icon families helps with tree-shaking
