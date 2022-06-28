import { isString } from 'lodash'
import {
  transformDateYM,
  transformYears,
  getFormUtcToLocalMoment,
  getFromNowString,
  orgMoment as moment
} from '@belloai/moment'

import {
  CHANNEL_MAPS,
  SCHOOL_TYPES,
  getAllImportFilterOptions
} from '../config/basic-data'

import { getArrAndFirstParams, getIdForApi } from '../utils'

/**
 * 修复age参数
 * @param resume resume对象
 */
export const resumeFixAge = (resume: Record<string, any>) => {
  if (isString(resume.age)) {
    const { age: ageStr } = resume
    const age = parseInt(ageStr, 10)
    if (!isNaN(age)) {
      resume.age = age
    } else {
      delete resume.age
    }
  }

  return resume
}

/**
 * 工作年限
 * @param resume
 * @param round 是否四舍五入
 * @returns
 */
export const getWorkYear = (resume: Record<string, any>, round = true) => {
  const { year_of_work_experience, start_year_of_employment } = resume
  let workYear = year_of_work_experience
  if (start_year_of_employment) {
    workYear = moment()
      .startOf('day')
      .diff(moment(start_year_of_employment), 'year', true)
    if (round) {
      workYear = Math.round(workYear)
    }
  }
  return workYear
}

/**
 * 拼接export链接
 * @param id
 * @param source
 * @returns
 */
export const exportUrl = (id, source) => {
  return `${source}/${id}/export`
}

export const isWomen = (resume: Record<string, any>) => resume.gender === '女'
export const isMan = (resume: Record<string, any>) => resume.gender === '男'

/**
 * 默认取名方式
 * @param resume
 * @returns
 */
export const getDefName = (resume: Record<string, any>) => {
  const { name, surname } = resume

  let returnName = name

  if (!returnName) {
    if (surname) {
      returnName = `${surname}${
        isWomen(resume) ? '女士' : isMan(resume) ? '先生' : '**'
      }`
    } else {
      returnName = '匿名'
    }
  }
  return returnName
}

/**
 * 轮次
 * @param resume
 * @returns
 */
export const getRound = (resume: Record<string, any>) => {
  const { latest_interview } = resume
  const { round = 0 } = latest_interview || {}
  return round
}

/**
 * 获取岁数
 * @param resume
 * @returns
 */
export const getAge = (resume: Record<string, any>) => {
  const { birthday, age } = resume

  let returnAge = age
  if (birthday) {
    returnAge = Math.floor(moment().diff(moment(birthday), 'year', true))
  }
  return returnAge
}

/**
 * 获取生日
 * @param resume
 * @returns
 */
export const getBirthday = (resume: Record<string, any>) => {
  const { birthday } = resume

  if (birthday) {
    const age = getAge(resume)
    return {
      age,
      birthday: moment(birthday).format('YYYY.MM.DD')
    }
  }

  return {}
}

/**
 * 获取开始工作时间
 * @param resume
 * @returns
 */
export const getStartYearOfEmployment = (resume: Record<string, any>) => {
  let { start_year_of_employment } = resume
  let start_year_of_employment_count = ''
  if (start_year_of_employment) {
    ;(start_year_of_employment_count = transformYears(
      start_year_of_employment
    )),
      (start_year_of_employment = moment(start_year_of_employment).format(
        'YYYY.MM.DD'
      ))
  }

  return {
    start_year_of_employment_count,
    start_year_of_employment
  }
}

/**
 * 获取工作年限
 * @param resume
 * @returns
 */
export const getYearOfWorkExperience = (resume: Record<string, any>) => {
  let yearOfWorkExperience = '暂无经验'
  const workYear = getWorkYear(resume, false)
  if (workYear > 0 && workYear < 1) {
    yearOfWorkExperience = `不足1年经验`
  } else if (workYear >= 1) {
    yearOfWorkExperience = `${getWorkYear(resume)}年经验`
  }

  return yearOfWorkExperience
}

export const transfromDate = (item, format = 'YYYY.MM') => {
  const { start_date, end_date, to_present } = item

  let start_date_fm = ''
  if (start_date) {
    start_date_fm = moment(start_date).format(format)
  }

  let work_year: string | null = ''
  let end_date_fm = ''
  if (to_present) {
    end_date_fm = '至今'
    work_year = transformDateYM(start_date, new Date())
  } else if (end_date) {
    end_date_fm = moment(end_date).format(format)
    work_year = transformDateYM(start_date, end_date)
  }

  if (!start_date_fm && !end_date_fm) {
    start_date_fm = '未知日期范围'
  }

  return {
    start_date_fm,
    work_year,
    end_date_fm
  }
}

export const getEmploymentsInfo = (employ: any[]) => {
  return (employ || []).map(item => {
    const { company_name, company_desc, description } = item
    return {
      ...item,
      ...transfromDate(item),
      company_name: company_name || '未知公司',
      company_desc: (company_desc || '').trim(),
      description: (description || '').trim()
    }
  })
}
/**
 * 工作信息
 * @param resume
 * @returns
 */
export const getEmployments = (resume: Record<string, any>) => {
  const { employments } = resume

  return getEmploymentsInfo(employments)
}

export const getSecondaryEmployments = (resume: Record<string, any>) => {
  const { secondary_employments } = resume
  return getEmploymentsInfo(secondary_employments)
}

export const getProjects = (resume: Record<string, any>) => {
  const { projects } = resume

  return (projects || []).map(item => {
    const { description } = item
    return {
      ...item,
      ...transfromDate(item),
      description: (description || '').trim()
    }
  })
}

export const getEducations = (resume: Record<string, any>) => {
  const { educations } = resume

  return (educations || []).map(item => {
    const { school_type } = item
    return {
      ...item,
      ...transfromDate(item),
      schoolType: SCHOOL_TYPES[school_type]
    }
  })
}

export const getTrainings = (resume: Record<string, any>) => {
  const { trainings } = resume

  return (trainings || []).map(item => {
    return {
      ...item,
      ...transfromDate(item)
    }
  })
}

export const getDefProgress = (resume: Record<string, any>) => {
  const { progress } = resume

  return progress || ''
}

export const getDefVirtualPhone = virtualPhone => {
  if (virtualPhone) {
    const { expired_at } = virtualPhone
    const expiredAt = getFormUtcToLocalMoment(expired_at)
    const nowDate = getFormUtcToLocalMoment(moment().format())

    if (expiredAt.isBefore(nowDate)) {
      return
    } else {
      return {
        ...virtualPhone,
        expired_at_text: expiredAt.format('YYYY.MM.DD HH:00')
      }
    }
  }

  return virtualPhone
}

interface Tag {
  type: string
  name: string
}

export const getTags = (resume: Record<string, any>) => {
  const { _tags } = resume
  const industry: Tag[] = []
  const other: Tag[] = []
  let num = 0

  const tags = _tags || []

  tags.forEach(tag => {
    if (tag.name === 'industry') {
      tag.type = 'info'
      industry.push(tag)
    } else if (tag.kind === 'good') {
      tag.type = 'blue'
      other.unshift(tag)
      num++
    } else if (tag.kind === 'bad') {
      tag.type = 'warning'
      other.push(tag)
    } else {
      tag.type = 'info'
      other.splice(num, 0, tag)
    }
  })
  // 如果有专升本  则去掉 211 ，985 标签
  const i = other.findIndex(val => val.name === 'education.upgraded')
  if (i > -1) {
    const index211 = other.findIndex(val => val.name === 'education.211')
    if (index211 > -1) {
      other.splice(index211, 1)
    }
    const index985 = other.findIndex(val => val.name === 'education.985')
    if (index985 > -1) other.splice(index985, 1)
  }

  return [...other, ...industry]
}

export const getSkillsProps = (resume: Record<string, any>) => {
  const { skills_props } = resume

  if (Array.isArray(skills_props)) {
    return skills_props.map(prop => {
      let { project_num = 0, skill_num = 0 } = prop
      const { skills } = prop

      if (Array.isArray(skills)) {
        skill_num = skills.length
        skills.forEach(item => {
          const { auth_proj_name } = item
          if (Array.isArray(auth_proj_name)) {
            ++project_num
          }
        })
      }

      return {
        ...prop,
        project_num,
        skill_num
      }
    })
  }

  return skills_props
}

export const getCredentials = (resume: Record<string, any>) => {
  const { credentials } = resume
  if (Array.isArray(credentials)) {
    return credentials.filter(({ type, name }) => type || name)
  }
  return credentials
}

export const getDescription = (resume: Record<string, any>) => {
  const { summary } = resume

  return (summary || '').trim()
}

export const getDefIsNextInterview = (resume: Record<string, any>) => {
  const { category, phone } = resume
  return category !== 2 && !phone
}

export const getResumeId = resume => {
  const { id } = resume

  let resumeId = getIdForApi(resume, 'resume')

  resumeId = resumeId || id

  return {
    resumeId,
    resume_id: resumeId
  }
}

export const getSourceId = (resume: Record<string, any>) => {
  const { source_id, id, category } = resume
  const resumeId = getIdForApi(resume, 'resume')

  if (category === 2) {
    return resumeId || id
  }
  return resumeId || source_id || id
}

// 转换渠道
export const getChannelName = (resume: Record<string, any>) => {
  let name = ''
  const { import_type, source_channel } = resume

  if (['user.manual'].includes(import_type)) {
    name = '主动上传'
  } else if (
    [
      'user.plugin',
      'wechat.helper',
      'wechat.consultant',
      'user.email',
      'xclient.resume_deliver',
      'user.upload',
      'web.resume_deliver'
    ].includes(import_type)
  ) {
    // 插件入库
    if (source_channel) {
      const channelName = CHANNEL_MAPS[source_channel]
      if (channelName && channelName !== '其他') {
        name = channelName
      }
    }
  } else {
    const { label: importType = '企业人才库' } =
      getAllImportFilterOptions().find(
        ({ postValue }) => postValue === import_type
      ) || {}

    name = importType
  }
  return name
}

export const getResumeUpdateFromNow = (resume: Record<string, any>) => {
  const { resume_update_time, received_at, channel } = resume

  let resumeUpdateFromNow = resume_update_time // 处理邮箱简历更新时间
  const isEmailImport = (channel || []).indexOf('user.email') > 0
  if (received_at && isEmailImport) {
    resumeUpdateFromNow = received_at
  }

  if (resumeUpdateFromNow) {
    return getFormUtcToLocalMoment(resumeUpdateFromNow).fromNow()
  }

  return ''
}

export const getUpdateFromNow = (resume: Record<string, any>) => {
  const { updated_at } = resume

  if (updated_at) {
    return getFormUtcToLocalMoment(updated_at).fromNow()
  }

  return ''
}

export const getCreatedFromNow = (resume: Record<string, any>) => {
  const { created_at } = resume

  if (created_at) {
    return getFromNowString(created_at)
  }

  return ''
}

export const getSimilarResumes = (resume: Record<string, any>) => {
  const { suspect_similar } = resume

  return (suspect_similar || []).filter(({ preview_url }) => !!preview_url)
}

export const getPhones = (resume: Record<string, any>) => {
  return getArrAndFirstParams(resume, 'phones', 'phone')
}

export const getEmails = (resume: Record<string, any>) => {
  return getArrAndFirstParams(resume, 'emails', 'email')
}

export const getIsNew = (resume: Record<string, any>, day?: string) => {
  const { created_at } = resume || {}
  let isNew
  if (created_at) {
    const days = getFormUtcToLocalMoment(moment(day).format()).diff(
      created_at,
      'd'
    )
    isNew = days < 7
  }

  return isNew
}
// 获取显示锁
export const getShowLock = (resume: Record<string, any>) => {
  const { lock } = resume || {}
  const { unlock_date, created_at } = lock || {}

  let showLock = false

  if (unlock_date) {
    showLock = moment(unlock_date).diff(moment(), 'seconds') > 0
  } else if (created_at) {
    showLock = true
  }

  return showLock
}

export const getLockParams = (resume: Record<string, any>) => {
  const { lock } = resume || {}
  return {
    showLock: getShowLock(resume),
    lockRecruitingId: getIdForApi(lock, 'recruiting')
  }
}

export const showOwner = item => {
  // 如果是插件自动入库，并且没有联系方式，那么显示企业人才库
  const { phones, emails, auto_save } = item || {}
  return !(
    (phones || []).length === 0 &&
    (emails || []).length === 0 &&
    auto_save
  )
}

export const getOccupantInfo = item => {
  const id = getIdForApi(item, 'owner')
  const infoList: any = []
  if (showOwner(item) && id) {
    infoList.push({
      prefix: '简历拥有者',
      userId: id
    })
  } else {
    infoList.push({
      prefix: '企业人才库'
    })
  }
  return infoList
}

export const getExtraUserInfoList = (resume: Record<string, any>) => {
  const { extraUserInfoList } = resume
  if (extraUserInfoList) {
    return extraUserInfoList
  }
  const occupantInfo = getOccupantInfo(resume)
  return occupantInfo
}