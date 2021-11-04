export enum AppRoute {
  Home = 'routes.home',
  About = 'routes.about',
  Changelog = 'routes.changelog',
  Login = 'routes.login'
}

export const AppRouteTitles: Record<AppRoute, string> = {
  [AppRoute.Home]: 'home.title',
  [AppRoute.About]: 'about.title',
  [AppRoute.Changelog]: 'changelog.title',
  [AppRoute.Login]: 'login.title'
};
