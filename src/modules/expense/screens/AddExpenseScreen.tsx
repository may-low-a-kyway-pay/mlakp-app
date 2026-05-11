import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { useAddExpense } from '@/src/modules/expense/hooks/useAddExpense'
import { styles } from '@/src/modules/expense/screens/AddExpenseScreen.styles'
import { avatarToneForIndex, initialsForName } from '@/src/modules/expense/utils/expenseFormatters'
import { displayNameForMember, secondaryTextForMember } from '@/src/modules/groups/utils/memberFormatters'
import { Card } from '@/src/shared/components/Card'
import { KeyboardAvoidingContainer } from '@/src/shared/components/KeyboardAvoidingContainer'
import { Screen } from '@/src/shared/components/Screen'
import { colors } from '@/src/shared/theme/colors'
import { appCurrency, formatMoneyLabel } from '@/src/shared/utils/currency'

export function AddExpenseScreen() {
  const {
    amount,
    allMembersSelected,
    canSubmit,
    currentUser,
    error,
    exactRemainingAmount,
    exactSplitTotalAmount,
    groups,
    isLoadingMembers,
    isPickerOpen,
    isSubmitting,
    members,
    refresh,
    selectGroup,
    selectedParticipants,
    selectedGroupID,
    selectedUserIDs,
    setAmount,
    setIsPickerOpen,
    setShareAmount,
    setSplitType,
    setTitle,
    shareAmounts,
    splitType,
    submit,
    title,
    toggleAllUsers,
    toggleUser,
  } = useAddExpense()

  return (
    <Screen contentStyle={styles.content} scroll={false}>
      <KeyboardAvoidingContainer style={styles.keyboardRoot}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={colors.text} name="arrow-back" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <Pressable onPress={() => refresh()} style={styles.backButton}>
            <Ionicons color={colors.textMuted} name="refresh" size={24} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>{appCurrency.symbol}</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.outline}
                style={styles.amountInput}
                value={amount}
              />
            </View>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.floatingField}>
              <Text style={styles.floatingLabel}>Expense Title</Text>
              <View style={styles.outlinedInput}>
                <Ionicons color={colors.textSoft} name="receipt-outline" size={24} />
                <TextInput
                  onChangeText={setTitle}
                  placeholder="Expense title"
                  placeholderTextColor={colors.outline}
                  style={styles.titleInput}
                  value={title}
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.inputLabel}>Group</Text>
              <View style={styles.groupList}>
                {groups.length === 0 && !isLoadingMembers ? (
                  <Text style={styles.helperText}>Create a group before adding an expense.</Text>
                ) : null}
                {groups.map((group) => {
                  const isSelected = group.id === selectedGroupID
                  return (
                    <Pressable
                      key={group.id}
                      onPress={() => selectGroup(group.id)}
                      style={[styles.groupPill, isSelected ? styles.groupPillActive : null]}
                    >
                      <Text style={[styles.groupPillText, isSelected ? styles.groupPillTextActive : null]}>
                        {group.name}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.inputLabel}>Paid by</Text>
              <View style={styles.selectBox}>
                <View style={styles.payerLeft}>
                  <View style={styles.meAvatar}>
                    <Text style={styles.meText}>ME</Text>
                  </View>
                  <Text style={styles.payerName}>{currentUser?.name ?? 'You'}</Text>
                </View>
              </View>
            </View>
          </Card>

          <Card style={styles.splitCard}>
            <View style={styles.splitHeader}>
              <Text style={styles.splitTitle}>Split Details</Text>
              <Pressable onPress={() => setIsPickerOpen(true)} style={styles.headerIconButton}>
                <Ionicons color={colors.primary} name="person-add-outline" size={24} />
              </Pressable>
            </View>

            <View style={styles.segmented}>
              <Pressable
                onPress={() => setSplitType('equal')}
                style={splitType === 'equal' ? styles.segmentActive : styles.segmentInactive}
              >
                <Text style={splitType === 'equal' ? styles.segmentActiveText : styles.segmentInactiveText}>
                  Equally
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSplitType('manual')}
                style={splitType === 'manual' ? styles.segmentActive : styles.segmentInactive}
              >
                <Text style={splitType === 'manual' ? styles.segmentActiveText : styles.segmentInactiveText}>
                  Exact Amounts
                </Text>
              </Pressable>
            </View>

            {isLoadingMembers ? (
              <View style={styles.loadingMembers}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.helperText}>Loading members...</Text>
              </View>
            ) : null}

            {!isLoadingMembers && selectedUserIDs.length === 0 ? (
              <Text style={styles.helperText}>Tap the add-person icon to choose who shares this expense.</Text>
            ) : null}

            <View style={styles.participants}>
              {selectedParticipants.map((participant, index) => {
                const avatarTone = avatarToneForIndex(index)

                return (
                  <View key={participant.id} style={styles.participantRow}>
                    <View style={styles.participantLeft}>
                      <View style={[styles.participantAvatar, { backgroundColor: avatarTone.bg }]}>
                        <Text style={[styles.participantInitials, { color: avatarTone.tone }]}>
                          {initialsForName(participant.name)}
                        </Text>
                      </View>
                      <View style={styles.participantText}>
                        <Text style={styles.participantName} numberOfLines={1}>
                          {participant.name}
                        </Text>
                        <Text style={styles.participantNote}>
                          {splitType === 'equal' ? 'Included equally' : 'Exact share'}
                        </Text>
                      </View>
                    </View>
                    {splitType === 'manual' ? (
                      <TextInput
                        keyboardType="decimal-pad"
                        onChangeText={(value) => setShareAmount(participant.id, value)}
                        placeholder="0.00"
                        placeholderTextColor={colors.outline}
                        style={styles.shareInput}
                        value={shareAmounts[participant.id] ?? ''}
                      />
                    ) : (
                      <View style={styles.checkbox}>
                        <Ionicons color={colors.white} name="checkmark" size={20} />
                      </View>
                    )}
                  </View>
                )
              })}
            </View>

            {splitType === 'manual' ? (
              <View style={styles.splitSummary}>
                <Text style={styles.summaryText}>Entered {formatMoneyLabel(exactSplitTotalAmount)}</Text>
                <Text style={styles.summaryText}>Remaining {formatMoneyLabel(exactRemainingAmount ?? '0.00')}</Text>
              </View>
            ) : null}
          </Card>

          {error ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.bottomAction}>
          <Pressable
            disabled={!canSubmit}
            onPress={submit}
            style={[styles.createButton, !canSubmit ? styles.createButtonDisabled : null]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons color={colors.white} name="checkmark-circle-outline" size={22} />
                <Text style={styles.createText}>Create Expense</Text>
              </>
            )}
          </Pressable>
        </View>

        <Modal animationType="fade" onRequestClose={() => setIsPickerOpen(false)} transparent visible={isPickerOpen}>
          <View style={styles.modalOverlay}>
            <Card style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Members</Text>
                <Pressable onPress={() => setIsPickerOpen(false)} style={styles.closeButton}>
                  <Ionicons color={colors.textMuted} name="close" size={24} />
                </Pressable>
              </View>

              {members.length > 0 ? (
                <Pressable onPress={toggleAllUsers} style={styles.selectAllRow}>
                  <View style={[styles.checkbox, allMembersSelected ? null : styles.checkboxInactive]}>
                    {allMembersSelected ? <Ionicons color={colors.white} name="checkmark" size={20} /> : null}
                  </View>
                  <Text style={styles.selectAllText}>{allMembersSelected ? 'Clear All' : 'Select All'}</Text>
                </Pressable>
              ) : null}

              <ScrollView contentContainerStyle={styles.memberList} keyboardShouldPersistTaps="handled">
                {members.length === 0 ? (
                  <Text style={styles.helperText}>This group has no other members yet.</Text>
                ) : null}
                {members.map((member, index) => {
                  const memberName = displayNameForMember(member)
                  const isSelected = selectedUserIDs.includes(member.user_id)
                  const avatarTone = avatarToneForIndex(index)

                  return (
                    <View key={member.id} style={styles.memberPickerRow}>
                      <View style={styles.participantLeft}>
                        <View style={[styles.participantAvatar, { backgroundColor: avatarTone.bg }]}>
                          <Text style={[styles.participantInitials, { color: avatarTone.tone }]}>
                            {initialsForName(memberName)}
                          </Text>
                        </View>
                        <View style={styles.participantText}>
                          <Text style={styles.participantName} numberOfLines={1}>
                            {memberName}
                          </Text>
                          <Text style={styles.participantNote}>{secondaryTextForMember(member)}</Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => toggleUser(member.user_id)}
                        style={[styles.checkbox, isSelected ? null : styles.checkboxInactive]}
                      >
                        {isSelected ? <Ionicons color={colors.white} name="checkmark" size={20} /> : null}
                      </Pressable>
                    </View>
                  )
                })}
              </ScrollView>

              <Pressable onPress={() => setIsPickerOpen(false)} style={styles.doneButton}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </Card>
          </View>
        </Modal>
      </KeyboardAvoidingContainer>
    </Screen>
  )
}
