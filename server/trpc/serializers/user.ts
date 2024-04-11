import type { TRawUser } from '../../db/db';

export type TUser = ReturnType<typeof userSerializer>;

export function userSerializer(basicUser: TRawUser) {
  const { password: _, ...noPasswordBasicUser } = basicUser;
  return {
    ...noPasswordBasicUser,
  };
}
