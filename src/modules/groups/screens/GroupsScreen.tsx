import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
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

type GroupsTab = 'groups' | 'people'

const groupsTabOptions: { label: string; value: GroupsTab }[] = [
  { label: 'Groups', value: 'groups' },
  { label: 'People', value: 'people' },
]

export function GroupsScreen() {
  const theme = useAppTheme()
  const { colors } = theme
  const styles = createStyles(theme)
  const [activeTab, setActiveTab] = useState<GroupsTab>('groups')
  const [copiedUsername, setCopiedUsername] = useState<string | null>(null)
  const {
    canAddMembers,
    closeGroupDetails,
    error,
    groupName,
    groups,
    isAddingMember,
    isCreateOpen,
    isCreating,
    isDetailsOpen,
    isLoading,
    isLoadingDetails,
    isSearchingMembers,
    isSearchingPeople,
    loadGroups,
    memberError,
    memberSearchResults,
    memberUsername,
    openGroupDetails,
    peopleQuery,
    peopleSearchResults,
    pendingMemberUsers,
    removePendingMember,
    selectMemberUser,
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
                  onPress={() => openGroupDetails(group)}
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

      <Modal animationType="fade" onRequestClose={closeGroupDetails} transparent visible={isDetailsOpen}>
        <KeyboardAvoidingContainer style={styles.modalOverlay}>
          <Card style={styles.detailsCard}>
            <View style={styles.modalHeader}>
              <View style={styles.detailsHeaderText}>
                <Text style={styles.modalTitle}>{selectedGroup?.group.name ?? 'Group'}</Text>
                <Text style={styles.detailsSubtitle}>{selectedGroup?.members.length ?? 0} members</Text>
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
              <>
                <ScrollView contentContainerStyle={styles.memberList} keyboardShouldPersistTaps="handled">
                  {selectedGroup?.members.map((member, index) => (
                    <View key={member.id} style={styles.memberRow}>
                      <View style={styles.left}>
                        <Avatar
                          initials={groupInitials(displayNameForMember(member))}
                          tone={avatarTones[index % avatarTones.length]}
                        />
                        <View style={styles.groupText}>
                          <View style={styles.memberTitleRow}>
                            <Text style={styles.groupName}>{displayNameForMember(member)}</Text>
                            <Text style={styles.roleTag}>{member.role}</Text>
                          </View>
                          <Text style={styles.groupMembers}>{secondaryTextForMember(member)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                {canAddMembers ? (
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
                                  <Text style={styles.groupName}>{user.name}</Text>
                                  <Text style={styles.groupMembers}>@{user.username}</Text>
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
                                <Text style={styles.groupName}>{user.name}</Text>
                                <Text style={styles.groupMembers}>@{user.username}</Text>
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
                      accessibilityState={{ disabled: isAddingMember || pendingMemberUsers.length === 0 }}
                      disabled={isAddingMember || pendingMemberUsers.length === 0}
                      onPress={submitMember}
                      style={[
                        styles.createButton,
                        (isAddingMember || pendingMemberUsers.length === 0) && styles.disabledButton,
                      ]}
                    >
                      {isAddingMember ? (
                        <ActivityIndicator color={colors.white} />
                      ) : (
                        <Ionicons color={colors.white} name="person-add-outline" size={22} />
                      )}
                      {!isAddingMember ? (
                        <Text style={styles.createText}>
                          {pendingMemberUsers.length > 1 ? `Add ${pendingMemberUsers.length} Members` : 'Add Member'}
                        </Text>
                      ) : null}
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>Only group owners can add members.</Text>
                )}
              </>
            ) : null}
          </Card>
        </KeyboardAvoidingContainer>
      </Modal>
    </Screen>
  )
}
