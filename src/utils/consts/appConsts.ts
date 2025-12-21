import type { UserAppSettings } from "../types"

export const TINKOFF_API_URL = 'https://invest-public-api.tinkoff.ru/rest'
export const CHROME_STORAGE_KEYS = {
    'T-key': 'T-key',
    'jwt-tokens': 'jwt-tokens',
    'isAuth': 'isAuth',
    'ws-news': 'ws-news',
    'userAppSettings': 'userAppSettings'
}

export const defaultUserAppSettings: UserAppSettings = {
    newsWidget: true,
    robotsWidget: true,
    pastuhWidget: true
}

export const APP_BACKEND_URL = 'https://extension.api.askerovgroup.ru'