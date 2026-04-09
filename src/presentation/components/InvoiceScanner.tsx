import React from 'react';
import { TouchableOpacity, StyleSheet, Alert, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Camera } from 'lucide-react-native/icons';
import { colors, spacing, borderRadius } from '../../core/theme';

interface InvoiceScannerProps {
  onScanComplete: (result: { uri: string; fileName: string }) => void;
}

export const InvoiceScanner: React.FC<InvoiceScannerProps> = ({
  onScanComplete,
}) => {
  const handleTakePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    });

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      onScanComplete({
        uri: asset.uri || '',
        fileName: asset.fileName || 'invoice.jpg',
      });
    }
  };

  const handleChooseFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      onScanComplete({
        uri: asset.uri || '',
        fileName: asset.fileName || 'invoice.jpg',
      });
    }
  };

  const showOptions = () => {
    Alert.alert('Scan Invoice', 'Choose how to add your invoice', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Gallery', onPress: handleChooseFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={showOptions}>
        <Camera size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
});
