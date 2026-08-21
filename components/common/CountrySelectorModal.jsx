import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WORLD_COUNTRIES, POPULAR_COUNTRIES } from '../../constants/worldCountries';
import { useTranslation } from 'react-i18next';

export default function CountrySelectorModal({ visible, onClose, onSelect, selectedCountry }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.code.includes(query) ||
      c.iso.toLowerCase().includes(query)
    );
  }, [search]);

  const renderItem = ({ item }) => {
    const isSelected = selectedCountry && (selectedCountry.iso === item.iso || selectedCountry.code === item.code);
    return (
      <TouchableOpacity
        style={[styles.countryItem, isSelected && styles.countryItemSelected]}
        onPress={() => {
          onSelect(item);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.flagText}>{item.flag}</Text>
        <View style={styles.countryTextCol}>
          <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
            {t(item.name) || item.name}
          </Text>
          <Text style={styles.isoText}>({item.iso})</Text>
        </View>
        <Text style={[styles.dialCode, isSelected && styles.dialCodeSelected]}>
          {item.code}
        </Text>
        {isSelected && (
          <MaterialCommunityIcons name="check-circle" size={18} color="#0575E6" style={{ marginLeft: 8 }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('Select Country')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('Search country name or code...')}
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>

          {/* Popular Countries Header (Only when search is empty) */}
          {!search.trim() && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.sectionHeader}>{t('Popular Countries')}</Text>
              <View style={styles.popularRow}>
                {POPULAR_COUNTRIES.slice(0, 8).map((c) => (
                  <TouchableOpacity
                    key={c.iso}
                    style={styles.popularChip}
                    onPress={() => {
                      onSelect(c);
                      onClose();
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{c.flag}</Text>
                    <Text style={styles.popularChipText}>{c.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {!search.trim() && (
            <Text style={styles.sectionHeader}>{t('All Countries')}</Text>
          )}

          {/* Virtualized Country List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderItem}
            keyExtractor={(item) => item.iso}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            maxToRenderPerBatch={30}
            windowSize={10}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '85%',
    minHeight: '60%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a237e',
  },
  closeBtn: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  popularRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0288d1',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryItemSelected: {
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  flagText: {
    fontSize: 22,
    marginRight: 12,
  },
  countryTextCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  countryNameSelected: {
    fontWeight: '800',
    color: '#0575E6',
  },
  isoText: {
    fontSize: 12,
    color: '#888',
  },
  dialCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  dialCodeSelected: {
    color: '#0575E6',
  },
});
