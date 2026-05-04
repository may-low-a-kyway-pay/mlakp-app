import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '@/src/shared/components/Card';
import { Screen } from '@/src/shared/components/Screen';
import { colors, shadows } from '@/src/shared/theme/colors';

const participants = [
  { initials: 'SM', name: 'Sarah Miller', tone: colors.tertiary, bg: colors.tertiarySoft },
  { initials: 'JD', name: 'John Davis', tone: colors.primary, bg: colors.primarySoft },
];

export function AddExpenseScreen() {
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons color={colors.text} name="arrow-back" size={32} />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Debt</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#c8ccdc"
            style={styles.amountInput}
          />
        </View>
      </View>

      <Card style={styles.formCard}>
        <View style={styles.floatingField}>
          <Text style={styles.floatingLabel}>Expense Title</Text>
          <View style={styles.outlinedInput}>
            <Ionicons color={colors.textSoft} name="receipt-outline" size={30} />
            <TextInput
              placeholder="e.g. Weekend Groceries"
              placeholderTextColor={colors.outline}
              style={styles.titleInput}
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.inputLabel}>Paid by</Text>
          <Pressable style={styles.selectBox}>
            <View style={styles.payerLeft}>
              <View style={styles.meAvatar}>
                <Text style={styles.meText}>ME</Text>
              </View>
              <Text style={styles.payerName}>You</Text>
            </View>
            <Ionicons color={colors.textMuted} name="chevron-down" size={28} />
          </Pressable>
        </View>
      </Card>

      <Card style={styles.splitCard}>
        <View style={styles.splitHeader}>
          <Text style={styles.splitTitle}>Split Details</Text>
          <Ionicons color={colors.primary} name="person-add-outline" size={30} />
        </View>

        <View style={styles.segmented}>
          <Pressable style={styles.segmentActive}>
            <Text style={styles.segmentActiveText}>Equally</Text>
          </Pressable>
          <Pressable style={styles.segmentInactive}>
            <Text style={styles.segmentInactiveText}>Exact Amounts</Text>
          </Pressable>
        </View>

        <View style={styles.participants}>
          {participants.map((participant) => (
            <View key={participant.name} style={styles.participantRow}>
              <View style={styles.participantLeft}>
                <View style={[styles.participantAvatar, { backgroundColor: participant.bg }]}>
                  <Text style={[styles.participantInitials, { color: participant.tone }]}>{participant.initials}</Text>
                </View>
                <View>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantNote}>Owes part</Text>
                </View>
              </View>
              <View style={styles.checkbox}>
                <Ionicons color="#ffffff" name="checkmark" size={24} />
              </View>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.bottomAction}>
        <Pressable style={styles.createButton}>
          <Ionicons color="#ffffff" name="checkmark-circle-outline" size={26} />
          <Text style={styles.createText}>Create Expense</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.surfaceVariant,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 72,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  backButton: {
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 44,
  },
  amountSection: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 34,
    paddingTop: 54,
  },
  amountLabel: {
    color: colors.textMuted,
    fontSize: 19,
    fontWeight: '600',
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 28,
  },
  currency: {
    color: colors.text,
    fontSize: 72,
    fontWeight: '800',
    opacity: 0.48,
  },
  amountInput: {
    color: colors.text,
    fontSize: 72,
    fontWeight: '800',
    minWidth: 190,
  },
  formCard: {
    gap: 24,
    marginHorizontal: 18,
    padding: 20,
  },
  floatingField: {
    paddingTop: 6,
  },
  floatingLabel: {
    backgroundColor: colors.surface,
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '600',
    left: 18,
    paddingHorizontal: 6,
    position: 'absolute',
    top: -4,
    zIndex: 1,
  },
  outlinedInput: {
    alignItems: 'center',
    borderColor: colors.outlineStrong,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 16,
    height: 64,
    paddingHorizontal: 18,
  },
  titleInput: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
  },
  fieldBlock: {
    gap: 10,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  selectBox: {
    alignItems: 'center',
    borderColor: colors.outline,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 68,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  payerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  meAvatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  meText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  payerName: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '700',
  },
  splitCard: {
    gap: 30,
    marginHorizontal: 18,
    marginTop: 30,
    padding: 20,
  },
  splitHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitTitle: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '800',
  },
  segmented: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 30,
    flexDirection: 'row',
    padding: 5,
  },
  segmentActive: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: 25,
    flex: 1,
    height: 50,
    justifyContent: 'center',
  },
  segmentInactive: {
    alignItems: 'center',
    borderRadius: 25,
    flex: 1,
    height: 50,
    justifyContent: 'center',
  },
  segmentActiveText: {
    color: colors.success,
    fontSize: 17,
    fontWeight: '800',
  },
  segmentInactiveText: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '700',
  },
  participants: {
    gap: 18,
  },
  participantRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  participantLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  participantAvatar: {
    alignItems: 'center',
    borderRadius: 24,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  participantInitials: {
    fontSize: 17,
    fontWeight: '800',
  },
  participantName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  participantNote: {
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: '600',
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 7,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  bottomAction: {
    backgroundColor: colors.surface,
    borderTopColor: colors.surfaceVariant,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 90,
    padding: 18,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 32,
    flexDirection: 'row',
    gap: 12,
    height: 64,
    justifyContent: 'center',
    ...shadows.floating,
  },
  createText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});
