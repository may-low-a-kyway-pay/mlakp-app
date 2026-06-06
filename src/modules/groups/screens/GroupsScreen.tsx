import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { avatarTones, formatUpdatedAt, groupInitials } from '@/src/modules/groups/utils/groupFormatters'
import { displayNameForMember, secondaryTextForMember } from '@/src/modules/groups/utils/memberFormatters'
import { createStyles } from '@/src/modules/groups/screens/GroupsScreen.styles'
import { useGroups } from '@/src/modules/groups/hooks/useGroups'
import { AppHeader } from '@/src/shared/components/AppHeader'
import { Avatar } from '@/src/shared/components/Avatar'
import { Card } from '@/src/shared/components/Card'
import { KeyboardAvoidingContainer } from '@/src/shared/components/KeyboardAvoidingContainer'
import { Screen } from '@/src/shared/components/Screen'
import { useAppTheme } from '@/src/shared/theme/ThemeContext'
import { formatMoneyLabel } from '@/src/shared/utils/currency'

type GroupsTab = 'groups' | 'people'
type GroupDetailsTab = 'members' | 'expenses'

const groupsTabOptions: { label: string; value: GroupsTab }[] = [
  { label: 'Groups', value: 'groups' },
  { label: 'People', value: 'people' },
]

const groupDetailsTabOptions: { label: string; value: GroupDetailsTab }[] = [
  { label: 'Members', value: 'members' },
  { label: 'Expenses', value: 'expenses' },
]

function formatExpenseDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export function GroupsScreen() {
  const theme = useAppTheme()
  const { colors } = theme
  const styles = useMemo(() => createStyles(theme), [theme])
  const [activeTab, setActiveTab] = useState<GroupsTab>('groups')
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null)
  const [detailsTab, setDetailsTab] = useState<GroupDetailsTab>('members')
  const {
    canManageMembers,
    closeExpenseDetails,
    closeGroupDetails,
    error,
    groupName,
    groupExpensePagination,
    groupExpenses,
    groups,
    hasLoadedGroupExpenses,
    isAddingMember,
    isCreateOpen,
    isCreating,
    isDetailsOpen,
    isLoading,
    isLoadingDetails,
    isLoadingExpenseDetails,
    isLoadingExpenses,
    isMutatingMembers,
    isSearchingMembers,
    isSearchingPeople,
    loadGroupExpenses,
    loadGroups,
    loadNextGroupExpenses,
    memberError,
    memberSearchResults,
    memberUsername,
    openExpenseDetails,
    openGroupDetails,
    peopleQuery,
    peopleSearchResults,
    pendingMemberUsers,
    removeMember,
    removePendingMember,
    removingMemberID,
    selectMemberUser,
    selectedExpense,
    selectedGroup,
    setGroupName,
    setIsCreateOpen,
    setMemberUsername,
    setPeopleQuery,
    submitGroup,
    submitMember,
  } = useGroups()

  async function copyUsername(username: string) {
    await Clipboard.setStringAsync(username)
    setCopiedUsername(username)
  }

  function updatePeopleQuery(value: string) {
    setPeopleQuery(value)
    setCopiedUsername(null)
  }

  function openGroup(group: Parameters<typeof openGroupDetails>[0]) {
    setDetailsTab('members')
    void openGroupDetails(group)
  }

  function selectDetailsTab(tab: GroupDetailsTab) {
    setDetailsTab(tab)
    if (tab === 'expenses' && !hasLoadedGroupExpenses && !isLoadingExpenses) {
      void loadGroupExpenses()
    }
  }

  function confirmMemberRemoval(member: NonNullable<typeof selectedGroup>['members'][number]) {
    const memberName = displayNameForMember(member)
    Alert.alert(
      'Remove group member?',
      `${memberName} will lose access to this group and cannot be included in new group expenses. Existing financial records will remain available.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void removeMember(member)
          },
        },
      ],
      { cancelable: true },
    )
  }

  const memberByUserID =
    selectedGroup?.members.reduce<Record<string, NonNullable<typeof selectedGroup>['members'][number]>>(
      (index, member) => {
        index[member.user_id] = member
        return index
      },
      {},
    ) ?? {}

  const selectedExpensePayer = selectedExpense ? memberByUserID[selectedExpense.expense.paid_by] : undefined

  function handleGroupDetailsRequestClose() {
    if (selectedExpense) {
      closeExpenseDetails()
      return
    }

    closeGroupDetails()
  }

  return (
    <Screen contentStyle={styles.content}>
      <AppHeader />
      <View style={styles.inner}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Groups</Text>
          {activeTab === 'groups' ? (
            <Pressable
              accessibilityLabel="Create group"
              accessibilityRole="button"
              onPress={() => setIsCreateOpen(true)}
              style={styles.addButton}
            >
              <Ionicons color={colors.white} name="add" size={22} />
            </Pressable>
          ) : (
            <View style={styles.addButtonSpacer} />
          )}
        </View>

        <View style={styles.tabRow}>
          {groupsTabOptions.map((option) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: activeTab === option.value }}
              key={option.value}
              onPress={() => setActiveTab(option.value)}
              style={[styles.tabButton, activeTab === option.value && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, activeTab === option.value && styles.tabTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.stateText}>Loading groups...</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBlock}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={loadGroups} style={styles.retryButton}>
              <Ionicons color={colors.white} name="refresh" size={18} />
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {activeTab === 'groups' ? (
          <>
            {!isLoading && !error && groups.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons color={colors.textSoft} name="people-outline" size={34} />
                <Text style={styles.emptyTitle}>No groups yet</Text>
                <Text style={styles.emptyText}>Create a group before adding shared expenses.</Text>
              </Card>
            ) : null}

            <View style={styles.list}>
              {groups.map((group, index) => (
                <Pressable
                  accessibilityLabel={`Open ${group.name} group details`}
                  accessibilityRole="button"
                  key={group.id}
                  onPress={() => openGroup(group)}
                >
                  <Card style={styles.groupCard}>
                    <View style={styles.left}>
                      <Avatar initials={groupInitials(group.name)} tone={avatarTones[index % avatarTones.length]} />
                      <View style={styles.groupText}>
                        <Text style={styles.groupName}>{group.name}</Text>
                        <Text style={styles.groupMembers}>{formatUpdatedAt(group.updated_at)}</Text>
                      </View>
                    </View>
                    <View style={styles.right}>
                      <Ionicons color={colors.textSoft} name="chevron-forward" size={24} />
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.peopleBlock}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Find People</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="username"
                autoCorrect={false}
                onChangeText={updatePeopleQuery}
                placeholder="Search by username"
                placeholderTextColor={colors.outline}
                returnKeyType="search"
                style={styles.input}
                value={peopleQuery}
              />
            </View>

            {isSearchingPeople ? (
              <View style={styles.searchState}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.stateText}>Searching...</Text>
              </View>
            ) : null}

            {!isSearchingPeople && peopleQuery.trim().length < 2 ? (
              <Card style={styles.emptyCard}>
                <Ionicons color={colors.textSoft} name="search-outline" size={34} />
                <Text style={styles.emptyTitle}>Search people</Text>
                <Text style={styles.emptyText}>Type at least 2 characters to find a username.</Text>
              </Card>
            ) : null}

            {!isSearchingPeople && peopleQuery.trim().length >= 2 && peopleSearchResults.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Ionicons color={colors.textSoft} name="person-outline" size={34} />
                <Text style={styles.emptyTitle}>No matching people</Text>
                <Text style={styles.emptyText}>Try another username.</Text>
              </Card>
            ) : null}

            {peopleSearchResults.length > 0 ? (
              <View style={styles.searchResults}>
                {peopleSearchResults.map((user, index) => {
                  const isCopied = copiedUsername === user.username

                  return (
                    <View key={user.id} style={styles.searchResultRow}>
                      <View style={styles.left}>
                        <Avatar initials={groupInitials(user.name)} tone={avatarTones[index % avatarTones.length]} />
                        <View style={styles.groupText}>
                          <Text style={styles.groupName}>{user.name}</Text>
                          <Text selectable style={styles.groupMembers}>
                            @{user.username}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        accessibilityLabel={`Copy ${user.username}`}
                        accessibilityRole="button"
                        onPress={() => copyUsername(user.username)}
                        style={styles.copyIconButton}
                      >
                        <Ionicons
                          color={isCopied ? colors.success : colors.primary}
                          name={isCopied ? 'checkmark' : 'copy-outline'}
                          size={22}
                        />
                      </Pressable>
                    </View>
                  )
                })}
              </View>
            ) : null}
          </View>
        )}
      </View>

      <Modal animationType="fade" onRequestClose={() => setIsCreateOpen(false)} transparent visible={isCreateOpen}>
        <KeyboardAvoidingContainer style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Group</Text>
              <Pressable
                accessibilityLabel="Close group form"
                accessibilityRole="button"
                onPress={() => setIsCreateOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons color={colors.textMuted} name="close" size={24} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Group Name</Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="off"
                onChangeText={setGroupName}
                placeholder="Group name"
                placeholderTextColor={colors.outline}
                returnKeyType="done"
                style={styles.input}
                value={groupName}
              />
            </View>

            <Pressable
              accessibilityLabel="Create group"
              accessibilityRole="button"
              accessibilityState={{ disabled: isCreating }}
              disabled={isCreating}
              onPress={submitGroup}
              style={[styles.createButton, isCreating && styles.disabledButton]}
            >
              {isCreating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Ionicons color={colors.white} name="checkmark" size={22} />
              )}
              {!isCreating ? <Text style={styles.createText}>Create Group</Text> : null}
            </Pressable>
          </Card>
        </KeyboardAvoidingContainer>
      </Modal>

      <Modal animationType="fade" onRequestClose={handleGroupDetailsRequestClose} transparent visible={isDetailsOpen}>
        <KeyboardAvoidingContainer style={styles.modalOverlay}>
          <Card accessibilityViewIsModal importantForAccessibility="yes" style={styles.detailsCard}>
            <View style={styles.modalHeader}>
              <View style={styles.detailsHeaderText}>
                <Text numberOfLines={1} style={styles.modalTitle}>
                  {selectedGroup?.group.name ?? 'Group'}
                </Text>
                <Text numberOfLines={1} style={styles.detailsSubtitle}>
                  {selectedGroup?.members.length ?? 0} members
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close group details"
                accessibilityRole="button"
                onPress={closeGroupDetails}
                style={styles.closeButton}
              >
                <Ionicons color={colors.textMuted} name="close" size={24} />
              </Pressable>
            </View>

            {isLoadingDetails ? (
              <View style={styles.stateBlock}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.stateText}>Loading members...</Text>
              </View>
            ) : null}

            {memberError ? (
              <View style={styles.memberErrorBlock}>
                <Text style={styles.errorText}>{memberError}</Text>
              </View>
            ) : null}

            {!isLoadingDetails ? (
              selectedExpense ? (
                <View style={styles.expenseDetails}>
                  <Pressable
                    accessibilityLabel="Back to group expenses"
                    accessibilityRole="button"
                    onPress={closeExpenseDetails}
                    style={styles.backToListButton}
                  >
                    <Ionicons color={colors.primary} name="chevron-back" size={22} />
                    <Text style={styles.backToListText}>Expenses</Text>
                  </Pressable>

                  <View style={styles.expenseSummary}>
                    <Text numberOfLines={2} style={styles.expenseDetailTitle}>
                      {selectedExpense.expense.title}
                    </Text>
                    <Text style={styles.expenseDetailAmount}>
                      {formatMoneyLabel(selectedExpense.expense.total_amount)}
                    </Text>
                    <View style={styles.expenseMetaGrid}>
                      <View style={styles.expenseMetaItem}>
                        <Text style={styles.expenseMetaLabel}>Paid by</Text>
                        <Text numberOfLines={1} style={styles.expenseMetaValue}>
                          {selectedExpensePayer ? displayNameForMember(selectedExpensePayer) : 'Group member'}
                        </Text>
                      </View>
                      <View style={styles.expenseMetaItem}>
                        <Text style={styles.expenseMetaLabel}>Split</Text>
                        <Text numberOfLines={1} style={styles.expenseMetaValue}>
                          {selectedExpense.expense.split_type === 'equal' ? 'Equal' : 'Manual'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Keep group expense details scoped to split shares; payment activity stays in private payment views. */}
                  <ScrollView contentContainerStyle={styles.shareList} style={styles.modalScrollArea}>
                    {selectedExpense.participants.map((participant, index) => {
                      const member = memberByUserID[participant.user_id]
                      const participantName = member ? displayNameForMember(member) : 'Group member'
                      const participantUsername = member ? secondaryTextForMember(member) : ''

                      return (
                        <View key={participant.id} style={styles.shareRow}>
                          <View style={styles.left}>
                            <Avatar
                              initials={groupInitials(participantName)}
                              tone={avatarTones[index % avatarTones.length]}
                            />
                            <View style={styles.groupText}>
                              <Text numberOfLines={1} style={styles.groupName}>
                                {participantName}
                              </Text>
                              {participantUsername ? (
                                <Text numberOfLines={1} style={styles.groupMembers}>
                                  {participantUsername}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                          <Text numberOfLines={1} style={styles.shareAmount}>
                            {formatMoneyLabel(participant.share_amount)}
                          </Text>
                        </View>
                      )
                    })}
                  </ScrollView>
                </View>
              ) : (
                <>
                  <View style={styles.tabRow}>
                    {groupDetailsTabOptions.map((option) => (
                      <Pressable
                        accessibilityRole="tab"
                        accessibilityState={{ selected: detailsTab === option.value }}
                        key={option.value}
                        onPress={() => selectDetailsTab(option.value)}
                        style={[styles.tabButton, detailsTab === option.value && styles.tabButtonActive]}
                      >
                        <Text style={[styles.tabText, detailsTab === option.value && styles.tabTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {detailsTab === 'members' ? (
                    <>
                      <ScrollView
                        contentContainerStyle={styles.memberList}
                        keyboardShouldPersistTaps="handled"
                        style={styles.modalScrollArea}
                      >
                        {selectedGroup?.members.map((member, index) => (
                          <View key={member.id} style={styles.memberRow}>
                            <View style={styles.left}>
                              <Avatar
                                initials={groupInitials(displayNameForMember(member))}
                                tone={avatarTones[index % avatarTones.length]}
                              />
                              <View style={styles.groupText}>
                                <View style={styles.memberTitleRow}>
                                  <Text numberOfLines={1} style={styles.groupName}>
                                    {displayNameForMember(member)}
                                  </Text>
                                  <Text style={styles.roleTag}>{member.role}</Text>
                                </View>
                                <Text numberOfLines={1} style={styles.groupMembers}>
                                  {secondaryTextForMember(member)}
                                </Text>
                              </View>
                            </View>
                            {canManageMembers && member.role !== 'owner' ? (
                              <Pressable
                                accessibilityHint="Removes this person from the group"
                                accessibilityLabel={`Remove ${displayNameForMember(member)} from group`}
                                accessibilityRole="button"
                                accessibilityState={{
                                  busy: removingMemberID === member.user_id,
                                  disabled: isMutatingMembers,
                                }}
                                disabled={isMutatingMembers}
                                hitSlop={4}
                                onPress={() => confirmMemberRemoval(member)}
                                style={[styles.removeMemberButton, isMutatingMembers && styles.disabledButton]}
                              >
                                {removingMemberID === member.user_id ? (
                                  <ActivityIndicator color={colors.danger} />
                                ) : (
                                  <Ionicons color={colors.danger} name="trash-outline" size={21} />
                                )}
                              </Pressable>
                            ) : null}
                          </View>
                        ))}
                      </ScrollView>

                      {canManageMembers ? (
                        <View style={styles.addMemberBlock}>
                          <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Add Member by Username</Text>
                            <TextInput
                              autoCapitalize="none"
                              autoComplete="username"
                              autoCorrect={false}
                              onChangeText={setMemberUsername}
                              placeholder="Search by username"
                              placeholderTextColor={colors.outline}
                              returnKeyType="search"
                              style={styles.input}
                              value={memberUsername}
                            />
                          </View>

                          {isSearchingMembers ? (
                            <View style={styles.searchState}>
                              <ActivityIndicator color={colors.primary} />
                              <Text style={styles.stateText}>Searching...</Text>
                            </View>
                          ) : null}

                          {memberSearchResults.length > 0 ? (
                            <View style={styles.searchResults}>
                              {memberSearchResults.map((user, index) => {
                                return (
                                  <View key={user.id} style={styles.searchResultRow}>
                                    <View style={styles.left}>
                                      <Avatar
                                        initials={groupInitials(user.name)}
                                        tone={avatarTones[index % avatarTones.length]}
                                      />
                                      <View style={styles.groupText}>
                                        <Text numberOfLines={1} style={styles.groupName}>
                                          {user.name}
                                        </Text>
                                        <Text numberOfLines={1} style={styles.groupMembers}>
                                          @{user.username}
                                        </Text>
                                      </View>
                                    </View>
                                    <Pressable
                                      accessibilityLabel={`Select ${user.username}`}
                                      accessibilityRole="button"
                                      onPress={() => selectMemberUser(user)}
                                      style={styles.addMemberIconButton}
                                    >
                                      <Ionicons color={colors.primary} name="add" size={22} />
                                    </Pressable>
                                  </View>
                                )
                              })}
                            </View>
                          ) : null}

                          {pendingMemberUsers.length > 0 ? (
                            <View style={styles.pendingList}>
                              <Text style={styles.pendingTitle}>
                                {pendingMemberUsers.length === 1 ? 'Selected Member' : 'Selected Members'}
                              </Text>
                              {pendingMemberUsers.map((user, index) => (
                                <View key={user.id} style={styles.pendingRow}>
                                  <View style={styles.left}>
                                    <Avatar
                                      initials={groupInitials(user.name)}
                                      tone={avatarTones[index % avatarTones.length]}
                                    />
                                    <View style={styles.groupText}>
                                      <Text numberOfLines={1} style={styles.groupName}>
                                        {user.name}
                                      </Text>
                                      <Text numberOfLines={1} style={styles.groupMembers}>
                                        @{user.username}
                                      </Text>
                                    </View>
                                  </View>
                                  <Pressable
                                    accessibilityLabel={`Remove ${user.username}`}
                                    accessibilityRole="button"
                                    onPress={() => removePendingMember(user.id)}
                                    style={styles.removePendingButton}
                                  >
                                    <Ionicons color={colors.textMuted} name="close" size={20} />
                                  </Pressable>
                                </View>
                              ))}
                            </View>
                          ) : null}

                          <Pressable
                            accessibilityLabel="Add selected members"
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isMutatingMembers || pendingMemberUsers.length === 0 }}
                            disabled={isMutatingMembers || pendingMemberUsers.length === 0}
                            onPress={submitMember}
                            style={[
                              styles.createButton,
                              (isMutatingMembers || pendingMemberUsers.length === 0) && styles.disabledButton,
                            ]}
                          >
                            {isAddingMember ? (
                              <ActivityIndicator color={colors.white} />
                            ) : (
                              <Ionicons color={colors.white} name="person-add-outline" size={22} />
                            )}
                            {!isAddingMember ? (
                              <Text style={styles.createText}>
                                {pendingMemberUsers.length > 1
                                  ? `Add ${pendingMemberUsers.length} Members`
                                  : 'Add Member'}
                              </Text>
                            ) : null}
                          </Pressable>
                        </View>
                      ) : (
                        <Text style={styles.emptyText}>Only group owners can add members.</Text>
                      )}
                    </>
                  ) : (
                    <View style={styles.expenseListBlock}>
                      {isLoadingExpenses && !hasLoadedGroupExpenses ? (
                        <View style={styles.searchState}>
                          <ActivityIndicator color={colors.primary} />
                          <Text style={styles.stateText}>Loading expenses...</Text>
                        </View>
                      ) : null}

                      {isLoadingExpenseDetails ? (
                        <View style={styles.searchState}>
                          <ActivityIndicator color={colors.primary} />
                          <Text style={styles.stateText}>Loading expense...</Text>
                        </View>
                      ) : null}

                      {hasLoadedGroupExpenses && groupExpenses.length === 0 ? (
                        <Card style={styles.emptyCard}>
                          <Ionicons color={colors.textSoft} name="receipt-outline" size={30} />
                          <Text style={styles.emptyTitle}>No expenses yet</Text>
                          <Text style={styles.emptyText}>Created expenses for this group will appear here.</Text>
                        </Card>
                      ) : null}

                      <ScrollView contentContainerStyle={styles.expenseList} style={styles.modalScrollArea}>
                        {groupExpenses.map((expense) => {
                          const payer = memberByUserID[expense.paid_by]

                          return (
                            <Pressable
                              accessibilityLabel={`Open ${expense.title} expense details`}
                              accessibilityRole="button"
                              key={expense.id}
                              onPress={() => openExpenseDetails(expense)}
                              style={styles.expenseRow}
                            >
                              <View style={styles.left}>
                                <View style={styles.expenseIcon}>
                                  <Ionicons color={colors.primary} name="receipt-outline" size={22} />
                                </View>
                                <View style={styles.groupText}>
                                  <Text numberOfLines={1} style={styles.groupName}>
                                    {expense.title}
                                  </Text>
                                  <Text numberOfLines={2} style={styles.groupMembers}>
                                    {payer ? `Paid by ${displayNameForMember(payer)}` : 'Group expense'} ·{' '}
                                    {formatExpenseDate(expense.expense_date ?? expense.created_at)}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.expenseAmountBlock}>
                                <Text numberOfLines={1} style={styles.expenseAmount}>
                                  {formatMoneyLabel(expense.total_amount)}
                                </Text>
                                <Ionicons color={colors.textSoft} name="chevron-forward" size={22} />
                              </View>
                            </Pressable>
                          )
                        })}
                      </ScrollView>

                      {groupExpensePagination && groupExpensePagination.page < groupExpensePagination.total_pages ? (
                        <Pressable
                          accessibilityLabel="Load more expenses"
                          accessibilityRole="button"
                          accessibilityState={{ disabled: isLoadingExpenses }}
                          disabled={isLoadingExpenses}
                          onPress={loadNextGroupExpenses}
                          style={[styles.loadMoreButton, isLoadingExpenses && styles.disabledButton]}
                        >
                          {isLoadingExpenses ? (
                            <ActivityIndicator color={colors.primary} />
                          ) : (
                            <>
                              <Ionicons color={colors.primary} name="add-circle-outline" size={22} />
                              <Text style={styles.loadMoreText}>Load More</Text>
                            </>
                          )}
                        </Pressable>
                      ) : null}
                    </View>
                  )}
                </>
              )
            ) : null}
          </Card>
        </KeyboardAvoidingContainer>
      </Modal>
    </Screen>
  )
}
