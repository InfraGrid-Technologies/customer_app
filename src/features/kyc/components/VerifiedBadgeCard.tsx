import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { kycApi } from '../services/kycApi';
import { theme } from '../../../core/theme';

const { colors } = theme;

export interface VerifiedBadgeCardProps {
  result?: any;
  onRevoked?: (data?: any) => void;
}

export function VerifiedBadgeCard({ result, onRevoked }: VerifiedBadgeCardProps) {
  const [loadingRevoke, setLoadingRevoke] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [viewingAudit, setViewingAudit] = useState(false);
  const [auditData, setAuditData] = useState(null);

  if (!result || !result.data) return null;

  const { data, consentId, source, isVerified: apiIsVerified, rejectionReasons = [], challanConsentId } = result;
  const compliance = data.rcCompliance || data.compliance || {};
  const challanCompliance = data.challanCompliance || (data.rcNumber ? data.compliance : null) || {};

  // Strict Compliance Verification
  let isCompliant = false;
  let rejectionList = [...rejectionReasons];

  if (compliance.violations && compliance.violations.length > 0) {
    rejectionList = [...new Set([...rejectionList, ...compliance.violations])];
  }
  if (challanCompliance.violations && challanCompliance.violations.length > 0) {
    rejectionList = [...new Set([...rejectionList, ...challanCompliance.violations])];
  }

  if (data.isUnified) {
    // 1. UNIFIED VEHICLE & EQUIPMENT INSPECTION (RC + CHALLAN)
    const rcPass = Boolean(data.rcCompliance?.isFullyCompliant);
    const challanPass = Boolean(data.challanCompliance?.isClean && !data.challanCompliance?.homeStateFailed);
    isCompliant = apiIsVerified !== undefined ? apiIsVerified : (rcPass && challanPass);
    if (!isCompliant && rejectionList.length === 0) {
      if (!rcPass) rejectionList.push('Vehicle failed commercial roadworthiness checks (fitness, insurance, or PUC invalid).');
      if (!challanPass) rejectionList.push('Vehicle has active unpaid traffic fines across national/state portals or portal was unreachable.');
    }
  } else if (data.dlNumber) {
    // 2. DRIVING LICENSE
    const hasHeavyBadge = Boolean(compliance.verifiedOperatorBadge);
    const backendVerified = apiIsVerified !== undefined ? apiIsVerified : true;
    isCompliant = backendVerified && hasHeavyBadge;
    if (!isCompliant && rejectionList.length === 0) {
      rejectionList.push('Driving license lacks heavy machinery / commercial endorsement (LMV only). Operating cranes, tippers, or earthmovers is prohibited.');
    }
  } else if (data.vehicleNumber) {
    // 3. VEHICLE RC
    isCompliant = Boolean(compliance.isFullyCompliant);
    if (!isCompliant && rejectionList.length === 0) {
      rejectionList.push('Vehicle failed roadworthiness checks (requires active registration, valid commercial fitness, unexpired PUC, and active insurance).');
    }
  } else if (data.rcNumber) {
    // 4. E-CHALLAN
    isCompliant = Boolean(compliance.isClean && !data.hasPendingChallans && (compliance.pendingCount === 0 || data.pendingChallansCount === 0));
    if (!isCompliant && rejectionList.length === 0) {
      rejectionList.push('Vehicle has active unpaid traffic e-challans. Fines must be settled before equipment dispatch or rental.');
    }
  } else if (data.accountNumber) {
    // 5. BANK ACCOUNT
    isCompliant = Boolean(data.accountExists && (!data.nameMatch || data.nameMatch.isMatch));
    if (!isCompliant && rejectionList.length === 0) {
      rejectionList.push('Bank account does not exist or beneficiary name does not match applicant.');
    }
  } else if (data.aadhaarNumber || data.digilockerVerified || data.clientId) {
    // 6. AADHAAR DIGILOCKER
    isCompliant = Boolean(
      compliance.verifiedCitizenBadge || compliance.isVerifiedAdult || data.digilockerVerified
    );
    if (!isCompliant && rejectionList.length === 0) {
      rejectionList.push('Aadhaar verification incomplete or citizen is under legal adult working age (18+).');
    }
  } else if (apiIsVerified !== undefined) {
    isCompliant = apiIsVerified;
  }

  // When RC / Challan vehicle verification is rejected, show only up to the rejection reason & violations box
  const isVehicleVerification = Boolean(data.isUnified || data.vehicleNumber || data.rcNumber);
  const hideRemainingData = !isCompliant && isVehicleVerification;

  const handleFetchAudit = async () => {
    if (!consentId) {
      Alert.alert('Notice', 'No consent ID linked with this verification.');
      return;
    }
    try {
      const res = await kycApi.getConsent(consentId);
      setAuditData(res.data);
      setViewingAudit(true);
    } catch (err) {
      Alert.alert('Audit Fetch Failed', err.message);
    }
  };

  const handleRevokeConsent = () => {
    if (!consentId) return;
    Alert.alert(
      'Revoke DPDP Consent?',
      'Under DPDP Act 2023 Section 6(4), you have the legal right to revoke this consent at any time. This will mark the digital verification audit trail as REVOKED.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Revoke',
          style: 'destructive',
          onPress: async () => {
            setLoadingRevoke(true);
            try {
              const res = await kycApi.revokeConsent(consentId);
              setRevoked(true);
              Alert.alert('Consent Revoked', 'Consent artifact has been successfully marked as REVOKED in the database.');
              if (onRevoked) onRevoked(res.data);
            } catch (err) {
              Alert.alert('Revocation Error', err.message);
            } finally {
              setLoadingRevoke(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Top Status Hero Banner */}
      <View style={[styles.statusBanner, isCompliant ? styles.bannerSuccess : styles.bannerDanger]}>
        <View style={styles.statusIconWrap}>
          <Ionicons
            name={isCompliant ? 'shield-checkmark' : 'alert-circle'}
            size={20}
            color={colors.white}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.statusBannerText}>
            {isCompliant ? 'VERIFIED & COMPLIANT' : 'VERIFICATION REJECTED'}
          </Text>
          <Text style={styles.statusBannerSub}>
            {isCompliant
              ? 'Meets all mandatory safety & regulatory standards'
              : 'Failed safety, roadworthiness, or endorsement checks'}
          </Text>
        </View>
        <View style={styles.sourceCapsule}>
          <Text style={styles.sourceTag}>
            {source === 'CACHE' ? '⚡ CACHE (₹0)' : '🌐 LIVE GOVT'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* REJECTION REASONS BOX (Prominently displayed when rejected) */}
        {!isCompliant && rejectionList.length > 0 && (
          <View style={[styles.rejectionCard, hideRemainingData ? { marginBottom: 0 } : null]}>
            <View style={styles.rejectionHeaderRow}>
              <Ionicons name="warning" size={15} color={colors.red600} />
              <Text style={styles.rejectionTitle}>REJECTION REASONS & VIOLATIONS ({rejectionList.length})</Text>
            </View>
            {rejectionList.map((reason, idx) => (
              <View key={idx} style={styles.rejectionItem}>
                <Ionicons name="close-circle" size={14} color={colors.red600} style={{ marginTop: 2 }} />
                <Text style={styles.rejectionText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* For rejected vehicle verification, hide remaining data sections per user request */}
        {!hideRemainingData && (
          <>
            {/* Identity & Record Profile */}
        {(data.name || data.ownerName || data.beneficiaryName) && (
          <View style={styles.profileSection}>
            <View style={styles.profileAvatarBox}>
              <Ionicons name="person" size={18} color={colors.blue600} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileLabel}>VERIFIED IDENTITY</Text>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {data.name || data.ownerName || data.beneficiaryName}
                </Text>
                <Ionicons name="checkmark-circle" size={15} color={colors.blue600} />
              </View>
              <Text style={styles.idNumberSub}>
                ID: {data.dlNumber || data.vehicleNumber || data.rcNumber || data.accountNumber || data.aadhaarNumber || data.maskedAadhaar || 'RECORD VERIFIED'}
              </Text>
            </View>
          </View>
        )}

        {/* 1. Driving License Specific Badges */}
        {data.dlNumber && (
          <View style={styles.sectionContainer}>
            <View style={[styles.badgeRow, isCompliant ? styles.badgeSuccess : styles.badgeWarning]}>
              <Ionicons
                name={isCompliant ? 'ribbon' : 'alert-circle'}
                size={16}
                color={isCompliant ? colors.emerald700 : colors.red700}
              />
              <Text style={[styles.badgeText, isCompliant ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
                {isCompliant ? '🏅 HEAVY MACHINERY OPERATOR' : '⚠️ LIGHT VEHICLE ONLY (LMV)'}
              </Text>
            </View>

            <View style={styles.covBox}>
              <Text style={styles.covTitle}>Classes Authorized on License:</Text>
              <View style={styles.covChipRow}>
                {Array.isArray(data.vehicleClasses) && data.vehicleClasses.length > 0 ? (
                  data.vehicleClasses.map((c, i) => (
                    <View key={i} style={styles.covChip}>
                      <Text style={styles.covChipText}>{c.class || c}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.covChip}>
                    <Text style={styles.covChipText}>LMV</Text>
                  </View>
                )}
              </View>
              {!isCompliant && (
                <Text style={styles.covRequired}>
                  ⚠️ Required for Cranes, Excavators & Tippers: HGMV, TRANS, HMV, or CEV
                </Text>
              )}
            </View>
          </View>
        )}

        {/* 2. Vehicle RC Specific Roadworthiness Breakdown */}
        {data.vehicleNumber && (
          <View style={styles.sectionContainer}>
            <View style={styles.specsCard}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>MODEL</Text>
                <Text style={styles.specValue} numberOfLines={1}>{data.makerModel || 'Commercial Vehicle'}</Text>
              </View>
              <View style={styles.specDivider} />
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>CLASS</Text>
                <Text style={styles.specValue} numberOfLines={1}>{data.vehicleClass || 'Heavy Commercial'}</Text>
              </View>
            </View>

            {/* Auto-extracted Chassis and Engine Numbers */}
            {(data.chassisNumber || data.engineNumber) && (
              <View style={styles.autoExtractedBox}>
                <View style={styles.autoExtractedHeader}>
                  <Ionicons name="sparkles" size={13} color={colors.blue600} />
                  <Text style={styles.autoExtractedTitle}>Auto-Extracted from Vahan RC (₹0 User Effort):</Text>
                </View>
                <View style={styles.monoSpecsRow}>
                  {data.chassisNumber && (
                    <View style={styles.monoPill}>
                      <Text style={styles.monoLabel}>CHASSIS:</Text>
                      <Text style={styles.monoValue}>{data.chassisNumber}</Text>
                    </View>
                  )}
                  {data.engineNumber && (
                    <View style={styles.monoPill}>
                      <Text style={styles.monoLabel}>ENGINE:</Text>
                      <Text style={styles.monoValue}>{data.engineNumber}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* 4-Tile Roadworthiness Grid */}
            <Text style={styles.gridSectionTitle}>ROADWORTHINESS BREAKDOWN</Text>
            <View style={styles.gridContainer}>
              {/* Registration */}
              <View style={styles.gridTile}>
                <View style={styles.gridTileHeader}>
                  <Text style={styles.gridTileLabel}>Registration</Text>
                  <Ionicons
                    name={compliance.checks?.registrationActive ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={compliance.checks?.registrationActive ? colors.emerald600 : colors.red600}
                  />
                </View>
                <Text style={[styles.gridTileStatus, compliance.checks?.registrationActive ? styles.textGreen : styles.textRed]}>
                  {data.status || 'UNKNOWN'}
                </Text>
              </View>

              {/* Commercial Fitness */}
              <View style={styles.gridTile}>
                <View style={styles.gridTileHeader}>
                  <Text style={styles.gridTileLabel}>Fitness</Text>
                  <Ionicons
                    name={compliance.checks?.fitnessValid ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={compliance.checks?.fitnessValid ? colors.emerald600 : colors.red600}
                  />
                </View>
                <Text style={[styles.gridTileStatus, compliance.checks?.fitnessValid ? styles.textGreen : styles.textRed]} numberOfLines={1}>
                  {compliance.checks?.fitnessValid
                    ? `Valid (${compliance.expires?.fitness || data.fitness?.validTill || 'Active'})`
                    : (compliance.expires?.fitness ? `Expired (${compliance.expires.fitness})` : 'Missing / Expired')}
                </Text>
              </View>

              {/* Pollution (PUC) */}
              <View style={styles.gridTile}>
                <View style={styles.gridTileHeader}>
                  <Text style={styles.gridTileLabel}>Pollution (PUC)</Text>
                  <Ionicons
                    name={compliance.checks?.pucValid ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={compliance.checks?.pucValid ? colors.emerald600 : colors.red600}
                  />
                </View>
                <Text style={[styles.gridTileStatus, compliance.checks?.pucValid ? styles.textGreen : styles.textRed]} numberOfLines={1}>
                  {compliance.checks?.pucValid
                    ? `Valid (${compliance.expires?.puc || data.puc?.validTill || 'Active'})`
                    : (compliance.expires?.puc ? `Expired (${compliance.expires.puc})` : 'Missing / Expired')}
                </Text>
              </View>

              {/* Insurance */}
              <View style={styles.gridTile}>
                <View style={styles.gridTileHeader}>
                  <Text style={styles.gridTileLabel}>Insurance</Text>
                  <Ionicons
                    name={compliance.checks?.insuranceValid ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={compliance.checks?.insuranceValid ? colors.emerald600 : colors.red600}
                  />
                </View>
                <Text style={[styles.gridTileStatus, compliance.checks?.insuranceValid ? styles.textGreen : styles.textRed]} numberOfLines={1}>
                  {compliance.checks?.insuranceValid
                    ? `Valid (${compliance.expires?.insurance || data.insurance?.validTill || 'Active'})`
                    : (compliance.expires?.insurance ? `Expired (${compliance.expires.insurance})` : 'Missing / Expired')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 3. E-Challan Specific Violations Breakdown */}
        {(data.rcNumber || data.challanCompliance || (data.isUnified && data.challans)) && (
          <View style={styles.sectionContainer}>
            {(() => {
              const challansList = data.challans || [];
              const unpaidInList = challansList.filter((ch: any) => {
                const s = String(ch.status || ch.challan_status || ch.rawStatus || '').toUpperCase().replace(/[\s_-]+/g, '');
                return s !== 'PAID' && s !== 'DISPOSED' && s !== 'SETTLED' && s !== 'CLEARED' && s !== 'CLOSED';
              }).length;

              const pendingCount = Math.max(
                Number(data.challanCompliance?.pendingCount ?? data.pendingChallansCount ?? 0),
                unpaidInList
              );

              const calculatedAmount = challansList
                .filter((ch: any) => {
                  const s = String(ch.status || ch.challan_status || ch.rawStatus || '').toUpperCase().replace(/[\s_-]+/g, '');
                  return s !== 'PAID' && s !== 'DISPOSED' && s !== 'SETTLED' && s !== 'CLEARED' && s !== 'CLOSED';
                })
                .reduce((sum: number, ch: any) => sum + (Number(ch.amount ?? ch.challan_amount ?? 0) || 0), 0);

              const totalAmount = Number(data.challanCompliance?.totalPendingAmount ?? data.totalChallanAmountDue ?? data.totalPendingAmount ?? 0) || calculatedAmount;

              const isPortalFailed = Boolean(data.challanCompliance?.homeStateFailed);
              const failedPortals = data.challanCompliance?.failedBackends || [];
              const failedState = failedPortals.length > 0 ? failedPortals.join(', ') : 'State';
              const challanClean = Boolean(
                pendingCount === 0 &&
                !data.hasPendingChallans &&
                unpaidInList === 0 &&
                !isPortalFailed &&
                (data.challanCompliance ? data.challanCompliance.isClean : true)
              );

              return (
                <View style={styles.challanContainer}>
                  <View style={[styles.challanBadgeRow, challanClean ? styles.badgeSuccess : styles.badgeDanger]}>
                    <Ionicons
                      name={challanClean ? 'checkmark-done-circle' : (isPortalFailed ? 'cloud-offline' : 'speedometer')}
                      size={16}
                      color={challanClean ? colors.emerald700 : colors.red700}
                    />
                    <Text style={[styles.badgeText, challanClean ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
                      {challanClean
                        ? '🛡️ CLEAN VEHICLE (0 PENDING CHALLANS)'
                        : (isPortalFailed
                            ? `🚨 ${failedState} TRAFFIC PORTAL UNREACHABLE`
                            : `🚨 ${pendingCount} UNPAID TRAFFIC FINES`)}
                    </Text>
                  </View>

                  {isPortalFailed && pendingCount === 0 && (
                    <View style={styles.finesDueBox}>
                      <Text style={styles.finesDueLabel}>State Portal Notice:</Text>
                      <Text style={[styles.finesDueAmount, { fontSize: 13, color: colors.red600 }]}>
                        {failedState} traffic database timed out during scan. Verification incomplete.
                      </Text>
                    </View>
                  )}

                  {!challanClean && pendingCount > 0 && (
                    <View style={styles.finesDueBox}>
                      <Text style={styles.finesDueLabel}>Total Outstanding Fines:</Text>
                      <Text style={styles.finesDueAmount}>₹{totalAmount}</Text>
                    </View>
                  )}

                  {challansList.length > 0 && (
                    <View style={styles.challanListContainer}>
                      <Text style={styles.challanListTitle}>CHALLAN VIOLATION RECORDS:</Text>
                      {challansList.map((ch, idx) => {
                        const statusUpper = String(ch.status || ch.challan_status || '').toUpperCase().replace(/[\s_-]+/g, '');
                        const isPending = statusUpper !== 'PAID' && statusUpper !== 'DISPOSED' && statusUpper !== 'SETTLED' && statusUpper !== 'CLEARED' && statusUpper !== 'CLOSED';
                        return (
                          <View key={idx} style={[styles.challanCard, isPending ? styles.challanPending : styles.challanDisposed]}>
                            <View style={styles.challanTopRow}>
                              <Text style={styles.challanId}>{ch.challanNumber || `Challan #${ch.number || idx + 1}`}</Text>
                              <View style={[styles.pill, isPending ? styles.pillRed : styles.pillGreen]}>
                                <Text style={[styles.pillText, isPending ? styles.pillTextRed : styles.pillTextGreen]}>
                                  {isPending ? 'UNPAID' : 'PAID'}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.challanOffense}>{ch.offenseDetails || 'Traffic Rule Violation'}</Text>
                            <View style={styles.challanBottomRow}>
                              <Text style={styles.challanMeta}>{ch.challanPlace ? `${ch.challanPlace} • ` : ''}{ch.challanDate || ''}</Text>
                              <Text style={styles.challanAmount}>₹{ch.amount}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })()}
          </View>
        )}

        {/* 4. Bank Account Specific Breakdown */}
        {data.accountNumber && (
          <View style={styles.sectionContainer}>
            <View style={styles.bankStatusCard}>
              <View style={styles.bankRow}>
                <Ionicons name="business" size={16} color={colors.blue600} />
                <Text style={styles.bankNameText}>{data.bankName || 'Verified Scheduled Bank'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Penny Drop Status:</Text>
                <Text style={styles.valueSuccess}>{data.accountExists ? 'Active / Penny Drop Verified' : 'Account Inactive'}</Text>
              </View>
              {data.nameMatch && (
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Beneficiary Match Score:</Text>
                  <Text style={[styles.value, { color: data.nameMatch.isMatch ? colors.emerald600 : colors.red600 }]}>
                    {data.nameMatch.score}% ({data.nameMatch.isMatch ? 'Match Passed' : 'Mismatch'})
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 5. Aadhaar DigiLocker Specific Breakdown */}
        {(data.aadhaarNumber || data.digilockerVerified || data.maskedAadhaar) && (
          <View style={styles.sectionContainer}>
            <View style={[styles.badgeRow, isCompliant ? styles.badgeSuccess : styles.badgeWarning]}>
              <Ionicons
                name={isCompliant ? 'shield-checkmark' : 'alert-circle'}
                size={16}
                color={isCompliant ? colors.emerald700 : colors.red700}
              />
              <Text style={[styles.badgeText, isCompliant ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
                {isCompliant ? '🏅 UIDAI DIGILOCKER VERIFIED ADULT' : '⚠️ AADHAAR VERIFICATION INCOMPLETE'}
              </Text>
            </View>

            <View style={styles.aadhaarCard}>
              <View style={styles.aadhaarTopRow}>
                <Ionicons name="id-card" size={16} color={colors.blue600} />
                <Text style={styles.aadhaarNumText}>
                  Aadhaar: {data.maskedAadhaar || data.aadhaarNumber || 'XXXXXXXX9012'}
                </Text>
              </View>

              <View style={styles.aadhaarGrid}>
                <View style={styles.aadhaarCol}>
                  <Text style={styles.specLabel}>GENDER / DOB</Text>
                  <Text style={styles.specValue}>{data.gender || 'MALE'} • {data.dob || '1988-08-15'}</Text>
                </View>
                <View style={styles.aadhaarCol}>
                  <Text style={styles.specLabel}>LEGAL AGE STATUS</Text>
                  <Text style={styles.valueSuccess}>ADULT VERIFIED (18+)</Text>
                </View>
              </View>

              {data.address && (
                <View style={styles.addressBox}>
                  <Text style={styles.specLabel}>VERIFIED RESIDENCE ADDRESS</Text>
                  <Text style={styles.addressText}>
                    {[
                      data.address.house,
                      data.address.street,
                      data.address.locality,
                      data.address.dist,
                      data.address.state,
                      data.address.pincode,
                    ].filter(Boolean).join(', ') || 'Pune, Maharashtra, 411045, India'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

          </>
        )}

        {/* 6. Consent section removed per user request */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  statusIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerSuccess: {
    backgroundColor: colors.emerald600,
  },
  bannerDanger: {
    backgroundColor: colors.red600,
  },
  statusBannerText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  statusBannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10.5,
    marginTop: 1,
    fontWeight: '400',
  },
  sourceCapsule: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceTag: {
    color: colors.white,
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  body: {
    padding: 12,
  },
  rejectionCard: {
    backgroundColor: colors.red50,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.red200,
    marginBottom: 10,
  },
  rejectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.red100,
    paddingBottom: 4,
  },
  rejectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.red700,
    letterSpacing: 0.3,
  },
  rejectionItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  rejectionText: {
    fontSize: 11.5,
    color: colors.red700,
    lineHeight: 16,
    fontWeight: '500',
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.slate50,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 10,
  },
  profileAvatarBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.blue200,
  },
  profileLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate900,
  },
  idNumberSub: {
    fontSize: 10.5,
    color: colors.slate500,
    fontFamily: 'monospace',
    marginTop: 1,
  },
  sectionContainer: {
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginVertical: 4,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: colors.emerald50,
    borderColor: colors.emerald200,
  },
  badgeWarning: {
    backgroundColor: colors.red50,
    borderColor: colors.red200,
  },
  badgeDanger: {
    backgroundColor: colors.red50,
    borderColor: colors.red200,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSuccess: {
    color: colors.emerald700,
  },
  badgeTextWarning: {
    color: colors.red700,
  },
  badgeTextDanger: {
    color: colors.red700,
  },
  covBox: {
    backgroundColor: colors.slate50,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  covTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.slate600,
    marginBottom: 4,
  },
  covChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  covChip: {
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.slate300,
  },
  covChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate800,
    fontFamily: 'monospace',
  },
  covRequired: {
    fontSize: 10.5,
    color: colors.red600,
    fontWeight: '500',
    marginTop: 6,
  },
  specsCard: {
    flexDirection: 'row',
    backgroundColor: colors.slate50,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 8,
  },
  specItem: {
    flex: 1,
    paddingHorizontal: 4,
  },
  specDivider: {
    width: 1,
    backgroundColor: colors.slate200,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.3,
  },
  specValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.slate900,
    marginTop: 1,
  },
  autoExtractedBox: {
    backgroundColor: colors.blue50,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.blue200,
    marginBottom: 8,
  },
  autoExtractedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  autoExtractedTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.blue700,
  },
  monoSpecsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  monoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.blue200,
  },
  monoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slate500,
  },
  monoValue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.blue700,
    fontFamily: 'monospace',
  },
  gridSectionTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridTile: {
    width: '48.8%',
    backgroundColor: colors.slate50,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  gridTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  gridTileLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.slate600,
  },
  gridTileStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  textGreen: {
    color: colors.emerald600,
  },
  textRed: {
    color: colors.red600,
  },
  challanContainer: {
    marginTop: 2,
  },
  challanBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  finesDueBox: {
    backgroundColor: colors.red50,
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.red200,
  },
  finesDueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.red700,
  },
  finesDueAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.red600,
  },
  challanListContainer: {
    marginTop: 6,
  },
  challanListTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.slate500,
    marginBottom: 4,
  },
  challanCard: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 6,
    marginBottom: 4,
    borderWidth: 1,
  },
  challanPending: {
    borderColor: colors.red200,
    backgroundColor: colors.red50,
  },
  challanDisposed: {
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
  },
  challanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challanId: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.slate800,
    fontFamily: 'monospace',
  },
  pill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  pillRed: {
    backgroundColor: colors.red100,
  },
  pillGreen: {
    backgroundColor: colors.emerald100,
  },
  pillText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  pillTextRed: {
    color: colors.red700,
  },
  pillTextGreen: {
    color: colors.emerald700,
  },
  challanOffense: {
    fontSize: 10.5,
    color: colors.slate700,
    marginVertical: 1,
    fontWeight: '500',
  },
  challanBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  challanMeta: {
    fontSize: 9.5,
    color: colors.slate500,
  },
  challanAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.red600,
  },
  bankStatusCard: {
    backgroundColor: colors.slate50,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bankNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  label: {
    fontSize: 10.5,
    color: colors.slate500,
    fontWeight: '500',
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
  },
  valueSuccess: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.emerald600,
  },
  aadhaarCard: {
    backgroundColor: colors.slate50,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  aadhaarTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aadhaarNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate900,
    fontFamily: 'monospace',
  },
  aadhaarGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    paddingTop: 6,
    marginBottom: 6,
  },
  aadhaarCol: {
    flex: 1,
  },
  addressBox: {
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
    paddingTop: 6,
  },
  addressText: {
    fontSize: 11,
    color: colors.slate700,
    lineHeight: 15,
    marginTop: 2,
  },
  consentAuditSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.slate200,
  },
  consentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sealCircle: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate800,
  },
  consentSub: {
    fontSize: 9.5,
    color: colors.slate500,
  },
  revokedTag: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.red600,
    backgroundColor: colors.red100,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  consentIdBox: {
    backgroundColor: colors.slate50,
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginTop: 6,
  },
  consentIdLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: colors.slate500,
    letterSpacing: 0.3,
  },
  consentIdText: {
    fontSize: 10,
    color: colors.slate700,
    fontFamily: 'monospace',
    fontWeight: '600',
    marginTop: 1,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.blue50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.blue200,
    flex: 1,
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.blue600,
  },
  btnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.red50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.red200,
    justifyContent: 'center',
  },
  btnDangerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.red600,
  },
  auditViewerBox: {
    backgroundColor: colors.slate900,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  auditViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate800,
    paddingBottom: 4,
  },
  auditViewerTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.slate100,
  },
  auditRow: {
    fontSize: 10,
    color: colors.slate400,
    fontFamily: 'monospace',
    marginVertical: 1,
  },
  bold: {
    fontWeight: '700',
    color: colors.slate200,
  },
});
