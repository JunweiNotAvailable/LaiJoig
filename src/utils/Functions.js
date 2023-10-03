import axios from "axios";
import config from '../../config.json';

// get month board by given year and month
export const getMonthBoard = (year, month) => {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay();
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const monthBoard = [];
  const firstWeek = Array(firstDayOfWeek).fill(null);
  let currentDay = 1;
  let currentWeek = firstWeek;
  while (currentDay <= daysInMonth) {
    currentWeek.push(new Date(`${year}-${`${month}`.padStart(2, '0')}-${`${currentDay}`.padStart(2, '0')}`));
    currentDay++;
    if (currentWeek.length === 7 || currentDay > daysInMonth) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      monthBoard.push(currentWeek);
      currentWeek = [];
    }
  }
  return monthBoard;
}

// get date string
export const getDateString = (date) => {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

// get date string in Chinese
export const getDateStringCh = (date) => {
  return `${date.getFullYear()}年${`${date.getMonth() + 1}`}月${`${date.getDate()}`}日`;
}

// get time string (hh:mm)
export const getTimeString = (time) => {
  return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
}

// get min from string (hh:mm)
export const getMinutesFromString = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// reverse
export const getTimeFromMinutes = (min) => {
  min = Math.max(0, Math.min(min, 1439));
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// convert 24 format to 12 format
export const to12HourFormat = (time24) => {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? '下午' : '上午';
  const hours12 = (hours % 12 || 12).toString();
  return `${period}${hours12}:${minutes.toString().padStart(2, '0')}`;
}

// create random color
export const getRandomHexColor = () => `#${Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0')}`;

// generate random string with given length
export const getRandomString = (length) => {
  return Array.from({ length: length }, () =>
      Math.random().toString(36).charAt(2)
  ).join('');
}

// get shared available times by given time slots
export const getSharedAvailTimes = (timeSlots) => {
  // initial available time is entire day
  let availTimes = ['00:00-23:59'];
  for (const timeSlot of timeSlots) {
    let newAvailTimes = [];
    for (const time of availTimes) {
      newAvailTimes = [...newAvailTimes, ...getExcludedPart(time, `${timeSlot.start}-${timeSlot.end}`)];
    }
    availTimes = newAvailTimes;
  }
  return availTimes;
}

// get the excluded part of two block of time
export const getExcludedPart = (blockA, blockB) => {
  const [startA, endA] = blockA.split('-');
  const [startB, endB] = blockB.split('-');
  const result = [];
  const startIntersect = startA < startB && endA > startB;
  const endIntersect = startA < endB && endA > endB;
  if (startIntersect) {
    result.push(`${startA}-${startB}`);
  }
  if (endIntersect) {
    result.push(`${endB}-${endA}`);
  }
  if (!startIntersect && !endIntersect) {
    if (startB <= startA && endB >= endA) {
      return result;
    }
    result.push(blockA);
  }
  return result;
}

// sleep function
export const sleep = (duration) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

// get pretty time format from given value
export const getPrettyTimeFormat = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let d;
  if (!(date instanceof Date)) {
    d = new Date(date);
  } else {
    d = date;
  }
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  // today
  if (d >= today) {
    return hhmm;
  }
  // yesterday
  if (today.getTime() - d.getTime() <= 86400000) {
    return '昨天 ' + hhmm;
  }
  // this year
  if (d.getFullYear() === today.getFullYear()) {
    return getDateString(d).slice(5).replaceAll('-', '/') + '\n' + hhmm;
  }
  return getDateString(d).replaceAll('-', '/') + '\n' + hhmm;
}

// get time from now in pretty format
export const getTimeFromNow = (date) => {
  if (!date) return '';
  const now = new Date();
  let d;
  if (!(date instanceof Date)) {
    d = new Date(date);
  } else {
    d = date;
  }
  const duration = now.getTime() - d.getTime();
  // less than an hour
  if (duration <= 3600000) {
    return `${Math.floor(duration / 60000)}分鐘前`;
  }
  // less than a day
  if (duration <= 86400000) {
    return `${Math.floor(duration / 3600000)}小時前`;
  }
  // less than a month
  if (duration <= 2678400000) {
    return `${Math.floor(duration / 86400000)}天前`;
  }
  // less than a year
  if (duration <= 31536000000) {
    return `${getMonthDifference(d, now)}個月前`;
  }
  return `${getYearDifference(d, now)}年前`;
}

// get all months between given months
export const getAllMonthsBetween = (startDate, endDate) => {
  const dates = [];

  while (startDate <= endDate) {
    dates.push(startDate.toISOString().slice(0, 7));
    startDate.setMonth(startDate.getMonth() + 1);
  }

  return dates;
}

// months distance
export const getMonthDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const months = (end.getFullYear() - start.getFullYear()) * 12;
  const monthDiff = end.getMonth() - start.getMonth();
  
  return months + monthDiff;
}

// year distance
export const getYearDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const months = (end.getFullYear() - start.getFullYear()) * 12;
  const monthDiff = end.getMonth() - start.getMonth();
  
  return months + monthDiff;
}

// get all date strings between two date strings
export const getDateStringsBetween = (startDateStr, endDateStr) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const dateStrings = [];
  while (startDate <= endDate) {
    dateStrings.push(startDate.toISOString().slice(0, 10));
    startDate.setDate(startDate.getDate() + 1);
  }
  return dateStrings;
}

// get extension from filename
export const getExtension = (filename) => {
  const extensionIndex = filename.lastIndexOf('.');
    if (extensionIndex === -1) {
      return '';
    }
    return filename.substring(extensionIndex);
}

// upload images to s3
export const uploadImage = async (bucketName, imageName, url) => {
  const imageBase64 = url.split(',')[1];
  await axios.post(`${config.s3}/access-image`, {
    bucketName: bucketName,
    name: imageName,
    image: imageBase64,
  });
};

// get image from s3
// get image from s3
export const getImageUrl = async (bucketName, filename) => {
  if (!filename) return '';
  const response = await axios.get(`${config.s3}/access-image?bucketName=${bucketName}&fileName=${filename}`);
  return 'data:image/jpeg;base64,' + response.data;
}
