import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ALL_13_VEHICLE_TYPES,
  RTO_COV_GROUPS,
  VehicleTypeItem,
} from '../constants/vehicleTaxonomy';
import { kycApi } from '../services/kycApi';

export interface VehicleTypeDropdownModalProps {
  visible: boolean;
  selectedType: string;
  onSelect: (option: VehicleTypeItem) => void;
  onClose: () => void;
}

export function VehicleTypeDropdownModal({
  visible,
  selectedType,
  onSelect,
  onClose,
}: VehicleTypeDropdownModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCovFilter, setActiveCovFilter] = useState<string>('ALL');
  const [itemsList, setItemsList] = useState<VehicleTypeItem[]>(ALL_13_VEHICLE_TYPES);

  // Sync dynamically with PostgreSQL database table kyc.rc_vehicle_categories
  useEffect(() => {
    kycApi.getVehicleCategories()
      .then((res) => {
        if (res?.success && Array.isArray(res?.data) && res.data.length > 0) {
          setItemsList(res.data);
        }
      })
      .catch(() => {
        // Retain static ALL_13_VEHICLE_TYPES fallback on network disconnect
      });
  }, []);

  const filteredItems = useMemo(() => {
    let items = itemsList;

    if (activeCovFilter !== 'ALL') {
      items = items.filter((item) => item.covCode.includes(activeCovFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.covCode.toLowerCase().includes(q) ||
          item.covDescription.toLowerCase().includes(q)
      );
    }

    return items;
  }, [searchQuery, activeCovFilter, itemsList]);

  const handleSelect = (item: VehicleTypeItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.covPillBadge}>
                <Text style={styles.covPillBadgeText}>RTO COV</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Select Vehicle Type</Text>
                <Text style={styles.subtitle}>
                  13 Fleet equipment types classified by official RTO COV codes
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={17} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by equipment name or COV code (e.g. CEV, HGV)..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* RTO COV Filter Chips */}
          <View style={styles.filterChipContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipScroll}>
              {RTO_COV_GROUPS.map((grp) => {
                const isActive = activeCovFilter === grp.code;
                return (
                  <TouchableOpacity
                    key={grp.id}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setActiveCovFilter(grp.code)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                      {grp.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* List of 13 Vehicle Types (No Icons) */}
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No vehicle types match your search.</Text>
                <TouchableOpacity
                  style={styles.clearSearchBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setActiveCovFilter('ALL');
                  }}
                >
                  <Text style={styles.clearSearchBtnText}>Reset Filters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredItems.map((item) => {
                const isSelected =
                  selectedType.toLowerCase() === item.name.toLowerCase() ||
                  selectedType.toLowerCase().includes(item.name.toLowerCase());

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemInfo}>
                      <View style={styles.itemNameRow}>
                        <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>
                          {item.name}
                        </Text>
                        <View style={[styles.covBadge, item.covCode.includes('HGV') ? styles.covBadgeHgv : styles.covBadgeCev]}>
                          <Text style={item.covCode.includes('HGV') ? styles.covBadgeTextHgv : styles.covBadgeTextCev}>
                            COV: {item.covCode}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.itemDescription}>
                        {item.covDescription}
                      </Text>
                    </View>

                    <View style={styles.itemRight}>
                      {isSelected ? (
                        <View style={styles.selectedCheck}>
                          <Ionicons name="checkmark-circle" size={22} color="#EA580C" />
                        </View>
                      ) : (
                        <View style={styles.unselectedRadio} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  covPillBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  covPillBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterChipContainer: {
    marginTop: 10,
    paddingBottom: 4,
  },
  filterChipScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    marginTop: 8,
    maxHeight: 400,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemCardSelected: {
    backgroundColor: '#FFFBF5',
    borderColor: '#EA580C',
  },
  itemInfo: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  itemNameSelected: {
    color: '#EA580C',
  },
  itemDescription: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
  },
  covBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  covBadgeCev: {
    backgroundColor: '#FEF3C7',
  },
  covBadgeTextCev: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  covBadgeHgv: {
    backgroundColor: '#EFF6FF',
  },
  covBadgeTextHgv: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  itemRight: {
    marginLeft: 12,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 13.5,
    color: '#64748B',
    fontWeight: '500',
  },
  clearSearchBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  clearSearchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA580C',
  },
});
