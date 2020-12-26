# README!

## Environment file format:

```
ScooterId=
UserId=
Password=
RefreshTokenAuthorization=
RefreshTokenUUID=
mongoHost=
```

## Mongodb format:

```
Authorization: {jwt token}
RefreshToken: {jwt refresh token}
Id:1
```

## TODO List

- Get scooter id from 車牌號碼 (License plate number of scooter)
- Let interval become timeout, then it can be control by "times".
- Timeout complete, then make a terminate machanism.