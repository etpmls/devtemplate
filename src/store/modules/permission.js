import { constantRoutes } from '@/router'
import { MenuGet } from '@/d/api/api'
import { filterAllRoutes } from '@/d/utils/utils'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise((resolve, reject) => {
      MenuGet().then(response => {
        const { data } = response
        data.push({ path: '*', redirect: '/404', hidden: true })
        let accessedRoutes
        if (roles.includes('Administrator')) {
          accessedRoutes = data || []
        } else {
          accessedRoutes = filterAsyncRoutes(data, roles)
        }
        const etpmlsRoutes = filterAllRoutes(accessedRoutes)
        commit('SET_ROUTES', etpmlsRoutes)
        resolve(accessedRoutes)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
