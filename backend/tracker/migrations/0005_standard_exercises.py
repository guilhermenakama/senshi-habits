from django.db import migrations

def create_standard_exercises(apps, schema_editor):
    Exercise = apps.get_model('tracker', 'Exercise')
    
    # Lista de Exercícios Padrão (Nome, Tipo, Grupo Muscular)
    exercises = [
        
        ("Supino Reto (Barra)", "strength", "Peito"),
        ("Supino Inclinado (Halteres)", "strength", "Peito"),
        ("Crucifixo (Máquina/Fly)", "strength", "Peito"),
        ("Flexão de Braço (Push-up)", "calisthenics", "Peito"),
        ("Crossover (Polia)", "strength", "Peito"),

        ("Puxada Alta (Pulldown)", "strength", "Costas"),
        ("Remada Curvada", "strength", "Costas"),
        ("Remada Baixa (Triângulo)", "strength", "Costas"),
        ("Barra Fixa (Pull-up)", "calisthenics", "Costas"),
        ("Levantamento Terra (Deadlift)", "strength", "Costas/Pernas"), 

        ("Agachamento Livre (Back Squat)", "strength", "Pernas"),
        ("Agachamento Frontal (Front Squat)", "strength", "Pernas"),
        ("Overhead Squat (OHS)", "strength", "Corpo Todo"), 
        ("Leg Press 45", "strength", "Pernas"),
        ("Cadeira Extensora", "strength", "Pernas"),
        ("Mesa Flexora", "strength", "Pernas"),
        ("Afundo (Lunge)", "strength", "Pernas"),
        ("Pistol Squat", "calisthenics", "Pernas"), 
        ("Elevação Pélvica", "strength", "Glúteos"),
        ("Panturrilha em Pé", "strength", "Panturrilha"),

        ("Desenvolvimento Militar (Strict Press)", "strength", "Ombros"),
        ("Push Press", "strength", "Ombros"), 
        ("Push Jerk", "strength", "Ombros/Corpo Todo"), 
        ("Split Jerk", "strength", "Ombros/Corpo Todo"),
        ("Elevação Lateral", "strength", "Ombros"),
        ("Elevação Frontal", "strength", "Ombros"),
        ("Face Pull", "strength", "Ombros"),

        ("Rosca Direta (Barra)", "strength", "Bíceps"),
        ("Rosca Martelo", "strength", "Bíceps"),
        ("Tríceps Testa", "strength", "Tríceps"),
        ("Tríceps Pulley (Corda)", "strength", "Tríceps"),
        ("Mergulho (Dips)", "calisthenics", "Tríceps"),
        ("Ring Dips (Argolas)", "calisthenics", "Tríceps/Peito"), 

        ("Snatch (Arranco Completo)", "strength", "Corpo Todo"),
        ("Power Snatch", "strength", "Corpo Todo"),
        ("Hang Snatch", "strength", "Corpo Todo"),
        ("Hang Power Snatch", "strength", "Corpo Todo"),
        
        ("Clean (Squat Clean)", "strength", "Corpo Todo"),
        ("Power Clean", "strength", "Corpo Todo"),
        ("Hang Clean (Hang Squat Clean)", "strength", "Corpo Todo"),
        ("Hang Power Clean", "strength", "Corpo Todo"),
        ("Clean & Jerk", "strength", "Corpo Todo"),
        
        ("Thruster", "strength", "Corpo Todo"),
        ("Cluster (Clean + Thruster)", "strength", "Corpo Todo"),
        ("Devil Press", "strength", "Corpo Todo"),
        ("Wall Ball", "calisthenics", "Corpo Todo"),
        ("Kettlebell Swing (American)", "strength", "Posterior/Costas"),
        ("Kettlebell Swing (Russian)", "strength", "Posterior/Costas"),
        ("Sumo Deadlift High Pull (SDHP)", "strength", "Corpo Todo"),
        ("Box Jump (Salto na Caixa)", "calisthenics", "Pernas"),
        ("Burpee", "calisthenics", "Corpo Todo"),
        ("Burpee Box Jump Over", "calisthenics", "Corpo Todo"),
        
        ("Toes to Bar (T2B)", "calisthenics", "Abdômen"),
        ("Chest to Bar (C2B)", "calisthenics", "Costas"),
        ("Bar Muscle Up", "calisthenics", "Costas/Braços"),
        ("Ring Muscle Up", "calisthenics", "Costas/Braços"),
        ("Rope Climb", "calisthenics", "Costas/Braços"),
        ("Handstand Push-up (HSPU)", "calisthenics", "Ombros"),
        ("Handstand Walk", "calisthenics", "Ombros"),
        
        ("Prancha (Plank)", "calisthenics", "Core"), 
        ("Abdominal Remador", "calisthenics", "Core"), 
        ("Abdominal Canivete (V-Up)", "calisthenics", "Core"),
        ("Superman", "calisthenics", "Core/Lombar"), 
        ("Hollow Rock", "calisthenics", "Core"),
        ("Arch Hold", "calisthenics", "Core/Lombar"),

        ("Corrida (Esteira)", "cardio", "Cardio"),
        ("Corrida (Rua)", "cardio", "Cardio"),
        ("Bike (Ergométrica/Assault)", "cardio", "Cardio"),
        ("Remo (Concept2)", "cardio", "Cardio"),
        ("Ski Erg", "cardio", "Cardio"),
        ("Natação", "cardio", "Cardio"),
        ("Double Under (Corda Dupla)", "cardio", "Cardio"),

        ("Alongamento de Posterior", "stretching", "Pernas"),
        ("Alongamento de Quadríceps", "stretching", "Pernas"),
        ("Mobilidade de Ombro", "stretching", "Ombros"),
        ("Mobilidade de Tornozelo", "stretching", "Pernas"),
        ("Mobilidade de Quadril", "stretching", "Pernas"),
        ("Yoga Flow", "stretching", "Corpo Todo"),
    ]

    # Bulk Create ignora conflitos se rodar 2x (opcional, mas seguro)
    objs = [
        Exercise(name=name, exercise_type=etype, muscle_group=muscle, user=None) 
        for name, etype, muscle in exercises
    ]
    # Se usar Postgres, ignore_conflicts=True evita erro se já existir
    Exercise.objects.bulk_create(objs, ignore_conflicts=True)

def remove_standard_exercises(apps, schema_editor):
    Exercise = apps.get_model('tracker', 'Exercise')
    Exercise.objects.filter(user__isnull=True).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0004_exercise'),
    ]

    operations = [
        migrations.RunPython(create_standard_exercises, remove_standard_exercises),
    ]