import { Tabs } from 'expo-router/js-tabs';

import { NavBar } from '@/components';

/** As 5 abas, nesta ordem: Início, Treinar, Explorar, LinkedIn, Perfil. Dicas abre pela Início. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="treinar" />
      <Tabs.Screen name="explorar" />
      <Tabs.Screen name="linkedin" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
