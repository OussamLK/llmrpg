# LRPG

An RPG where you can pick any story to play.

## Running locally

- Run the python script to create the pydantic schemata
```
> cd pydantic_models
> python3 -m venv venv
> source venv/bin/activate
> pip install -r requirements.txt
> python3 rpg_models.py

```

- Run the backend
```
> cd backend
> yarn install
> export OPENAI_API_KEY='you_openai_key'
> yarn dev
```

- Run the frontend
```
> cd frontend
> yarn install
> yarn dev
```

