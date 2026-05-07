import { GroupMember } from '@/src/modules/groups/types/groupTypes'

export function displayNameForMember(member: GroupMember) {
  if (member.user?.id === member.user_id && member.user.name.trim()) {
    return member.user.name.trim()
  }

  return `User ${member.user_id.slice(0, 8)}`
}

export function secondaryTextForMember(member: GroupMember) {
  if (member.user?.id === member.user_id && member.user.username.trim()) {
    return `@${member.user.username.trim()}`
  }

  if (member.user?.id === member.user_id && member.user.email.trim()) {
    return member.user.email.trim()
  }

  return member.user_id
}
