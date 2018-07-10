# platziverse-mqtt

## `agent/connected`

```js
{
  agent: {
    uuid, // autp generar
    name,   // definir por configuracion
    usename, // definir por configuracion
    hostname, // obtener del sistema operativo
    pid // obtener del proceso
  }
}
```

## `agent/disconnected`
```js
{
  agent: {
    uuid
  }
}
```

## `agent/message`
```js
{
  agent,
  metrics: [
    {
      type,
      value
    }
  ],
  timestamp // generar cuando generemos el mesaje
}
```