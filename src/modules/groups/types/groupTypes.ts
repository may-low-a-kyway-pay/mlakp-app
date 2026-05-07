export type Group = {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

export type GroupMemberUser = {
  id: string
  name: string
  username: string
  email: string
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  user?: GroupMemberUser
}

export type GroupListResponse = {
  success: true
  data: {
    groups: Group[]
  }
}

export type GroupResponse = {
  success: true
  data: {
    group: Group
  }
}

export type GroupDetailsResponse = {
  success: true
  data: {
    group: Group
    members: GroupMember[]
  }
}
