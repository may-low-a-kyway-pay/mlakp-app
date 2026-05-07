import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native'
import { avatarTones, formatUpdatedAt, groupInitials } from '@/src/modules/groups/utils/groupFormatters'
import { styles } from '@/src/modules/groups/screens/GroupsScreen.styles'
import { useGroups } from '@/src/modules/groups/hooks/useGroups'
import { AppHeader } from '@/src/shared/components/AppHeader'
import { Avatar } from '@/src/shared/components/Avatar'
import { Card } from '@/src/shared/components/Card'
import { Screen } from '@/src/shared/components/Screen'
import { colors } from '@/src/shared/theme/colors'

export function GroupsScreen() {
  const {
    error,
    groupName,
    groups,
    isCreateOpen,
    isCreating,
    isLoading,
    loadGroups,
    setGroupName,
    setIsCreateOpen,
    submitGroup,
  } = useGroups()

  return (
    <Screen contentStyle={styles.content}>
      <AppHeader />
      <View style={styles.inner}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Groups</Text>
          <Pressable onPress={() => setIsCreateOpen(true)} style={styles.addButton}>
            <Ionicons color={colors.white} name="add" size={22} />
          </Pressable>
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
            <Pressable onPress={loadGroups} style={styles.retryButton}>
              <Ionicons color={colors.white} name="refresh" size={18} />
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error && groups.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons color={colors.textSoft} name="people-outline" size={34} />
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptyText}>Create a group before adding shared expenses.</Text>
          </Card>
        ) : null}

        <View style={styles.list}>
          {groups.map((group, index) => (
            <Card key={group.id} style={styles.groupCard}>
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
          ))}
        </View>
      </View>

      <Modal animationType="fade" onRequestClose={() => setIsCreateOpen(false)} transparent visible={isCreateOpen}>
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Group</Text>
              <Pressable onPress={() => setIsCreateOpen(false)} style={styles.closeButton}>
                <Ionicons color={colors.textMuted} name="close" size={24} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Group Name</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={setGroupName}
                placeholder="e.g. Housemates"
                placeholderTextColor={colors.outline}
                style={styles.input}
                value={groupName}
              />
            </View>

            <Pressable
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
        </View>
      </Modal>
    </Screen>
  )
}
