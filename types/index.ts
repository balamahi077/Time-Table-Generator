export interface Lecturer {
  id?: number
  name: string
  subject_name: string
  subject_code: string
  room_no?: string
  branch?: string
  semester?: number
  section?: string
}

export interface TimetableEntry {
  lecturer: any
  id?: number
  branch: string
  semester: number
  section: string
  day: string
  time_slot: string
  subject_name?: string
  subject_code?: string
  lecturer_name?: string
  room_no?: string
  is_lab?: boolean
  lab_duration?: number
  hidden?: boolean
}

export interface Branch {
  category: "undergraduate" | "postgraduate"
  name: string
  code: string
}
